// Start an isolated Next dev server on 3107 with NEXT_PUBLIC_URL=http://127.0.0.1:3108/.
// This smoke supplies the fake API for SSR and browser requests. No live backend.
const { chromium, expect } = require("@playwright/test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const XLSX = require("xlsx");
const base = "http://127.0.0.1:3107";
const api = "http://127.0.0.1:3108";
const requests = [];
const date = "2026-10-14T12:00:00.000Z";
const customer = { id: "C1", name: "Cliente local", state: "ACTIVE", phoneNumbers: [], addresses: [], createdAt: date, updatedAt: date };
const products = Array.from({ length: 1200 }, (_, i) => ({
  id: `01CG${String(i).padStart(5, "0")}`, name: i === 1199 ? "Producto última página" : `Producto local ${i}`,
  state: "ACTIVE", cost: 10, price: 20, stockControl: false, createdAt: date, updatedAt: date,
}));
const budget = id => ({ id, state: id === "DRAFT1" ? "DRAFT" : "CONFIRMED", customer, products: [], paymentsMade: [],
  paymentMethods: ["Efectivo"], globalDiscount: 0, additionalCharge: 0, createdAt: date, updatedAt: date, stockFlow: "none", total: 0 });
let activeFailure;
const recovered = new Set();
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", base);
  res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  const url = new URL(req.url, api);
  const [account, entity, id] = url.pathname.split("/").filter(Boolean);
  const params = Object.fromEntries(url.searchParams);
  const hasProducts = account?.includes("missing-flag") ? undefined : account?.includes("null-flag") ? null : !account?.includes("unused");
  requests.push({ account, entity, id, params, method: req.method });
  if (req.method === "POST" && entity === "stock-flows" && account === "finite-supplier-tools") {
    res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ statusOk: true })); return;
  }
  if (req.method === "DELETE" && ["brands", "suppliers"].includes(entity) && account.includes("unused")) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ statusOk: true }));
    return;
  }
  if (req.method !== "GET") {
    activeFailure?.(new Error("Smoke attempted a write"));
    res.writeHead(405); res.end(); return;
  }
  let body = { statusOk: true };
  if (entity === "products") {
    if (/^finite-(brand|supplier)-(admin|readonly|unused|missing-flag|null-flag)$/.test(account)) {
      activeFailure?.(new Error("Entity deletion validation requested products"));
      res.writeHead(429); res.end(); return;
    }
    if (requests.filter(r => r.account === account && r.entity === "products").length > 10) {
      activeFailure?.(new Error("More than 10 product requests: aborted"));
      res.writeHead(429); res.end(); return;
    }
    const page = Number(params.pageNumber), size = Number(params.pageSize);
    if (account.includes("supplier-tools")) {
      assert.equal(params.supplierId, "VA", "Supplier tools must send the confirmed backend filter on every page");
      if (account.includes("page-error") && page === 2 && !recovered.has(account)) {
        res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ statusOk: false, message: "mock page 2 failed" })); return;
      }
    }
    const collection = account.includes("supplier-tools")
      ? products.slice(0, account.includes("one-page") ? 500 : 1200).map(product => ({ ...product, id: product.id.replace(/^01/, "VA"), stockControl: true }))
      : products;
    body.products = collection.slice((page - 1) * size, page * size);
    if (params.count === "true" && !account.includes("missing-count")) body.count = String(collection.length);
    body.pageNumber = page; body.pageSize = size;
  } else if (entity === "brands" && id) body.brand = { id: "CG", name: "Marca local", state: "ACTIVE", hasProducts };
  else if (entity === "brands") { body.brands = []; body.count = 0; }
  else if (entity === "suppliers" && id) body.supplier = { id, name: "Proveedor local", state: "ACTIVE", phoneNumbers: [], emails: [], addresses: [], comments: "", hasProducts };
  else if (entity === "suppliers") { body.suppliers = []; body.count = 0; }
  else if (entity === "budgets" && id) body.budget = budget(id);
  else if (entity === "customers") { body.customers = [customer]; body.count = 1; }
  else if (entity === "settings") {
    body.settings = [{ entity: "budget", defaultPageDateRange: { value: 3 } }, { entity: "general", paymentMethods: ["Efectivo"] }];
    body.count = 2;
  } else if (entity === "stock-flows") body.stockFlows = [];
  else if (entity === "flows") body.flows = [];
  else if (entity === "payments") body.payments = [];
  else if (entity === "users") { body.users = []; body.count = 0; }
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
});

(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(3108, "127.0.0.1", resolve));
    browser = await chromium.launch({ headless: true });
    async function scenario(name, route, expected, inspect, role = "sadmin") {
      if (process.env.SMOKE_FILTER && !new RegExp(process.env.SMOKE_FILTER).test(name)) return;
      const context = await browser.newContext();
      const accountId = `finite-${name}`;
      const user = { roles: [role], accountId, firstName: "Prueba", lastName: "Local", name: "Prueba Local", isAuthorized: true };
      await context.addCookies([{ name: "token", value: "local-mock", url: base },
        { name: "userData", value: encodeURIComponent(Buffer.from(JSON.stringify(user)).toString("base64")), url: base }]);
      await context.addInitScript(() => {
        localStorage.setItem("latestNews", "2026-09-21");
        window.storageOps = [];
        new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
          if (node.tagName === "IFRAME") node.addEventListener("load", () => {
            node.contentWindow.print = () => { window.printedProducts = node.contentDocument.querySelectorAll('img[id^="barcode-"][src^="data:image/"]').length; };
          });
        }))).observe(document, { childList: true, subtree: true });
        for (const method of ["get", "getAll", "put", "add", "clear", "delete", "openCursor", "count"]) {
          const original = IDBObjectStore.prototype[method];
          IDBObjectStore.prototype[method] = function (...args) {
            window.storageOps.push(`${this.name}.${method}`);
            return original.apply(this, args);
          };
        }
      });
      await context.route("**/*", route => {
        const origin = new URL(route.request().url()).origin;
        return [base, api].includes(origin) ? route.continue() : route.abort();
      });
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      let timer;
      const guarded = new Promise((_, reject) => {
        activeFailure = error => { context.close().catch(() => {}); reject(error); };
        timer = setTimeout(() => activeFailure(new Error(`${name}: 30s scenario timeout`)), 30000);
      });
      try {
        await Promise.race([guarded, (async () => {
          await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 25000 });
          await inspect(page);
          const productRequests = requests.filter(r => r.account === accountId && r.entity === "products");
          assert.equal(productRequests.length, expected, `${name} request count`);
          if (expected === 3) {
            assert.deepEqual(productRequests.map(r => r.params.pageNumber), ["1", "2", "3"]);
            assert.deepEqual(productRequests.map(r => r.params.count), ["true", "false", "false"]);
            assert.ok(productRequests.every(r => r.params.pageSize === "500"));
          }
          assert.deepEqual(errors, []);
          console.log(`PASS ${name}: ${expected} product request(s), completed`);
        })()]);
      } finally {
        clearTimeout(timer); activeFailure = undefined; await context.close();
      }
    }
    const selector = async page => {
      const input = page.getByTestId("budget-product-search").locator("input");
      await expect(input).toBeVisible();
      await input.fill("Producto última página");
      await expect(page.locator(".results .result").filter({ hasText: "Producto última página" })).toBeVisible();
    };
    const assertSupplierTools = async (page, disabled) => {
      let choosers = 0, downloads = 0;
      const onChooser = () => choosers++;
      const onDownload = () => downloads++;
      page.on("filechooser", onChooser); page.on("download", onDownload);
      await page.getByTestId("nav-action-stock/excel").click();
      const tools = [
        page.getByTestId("nav-action-imprimir códigos de productos"),
        page.getByTestId("nav-action-descargar productos del proveedor"),
        page.getByRole("button", { name: "Cargar stock", exact: true }),
        page.getByRole("button", { name: "Descontar stock", exact: true }),
        page.getByTestId("nav-action-eliminar todos los productos del proveedor"),
      ];
      for (const tool of tools) {
        if (disabled) {
          await expect(tool).toBeDisabled();
          await tool.dispatchEvent("click");
          await expect(tool).not.toHaveClass(/loading/);
        } else await expect(tool).toBeEnabled();
      }
      await expect(page.getByTestId("nav-action-descargar plantilla de stock")).toBeEnabled();
      await expect(page.getByTestId("nav-action-desactivar proveedor")).toBeEnabled();
      await expect(page.getByText("No hay productos de este proveedor.", { exact: true })).toHaveCount(0);
      assert.equal(choosers, 0); assert.equal(downloads, 0);
      page.off("filechooser", onChooser); page.off("download", onDownload);
    };
    await scenario("create", "/ventas/crear", 3, selector);
    await scenario("draft", "/ventas/DRAFT1/borrador", 3, selector);
    await scenario("brand-admin", "/marcas/CG", 0, async page => {
      await expect(page.getByTestId("brand-name-field")).toContainText("Marca local");
      assert.equal(requests.filter(r => r.account === "finite-brand-admin" && r.entity === "products").length, 0);
      const button = page.getByTestId("nav-action-eliminar marca");
      await expect(button).toBeDisabled();
      await button.dispatchEvent("click");
      await expect(page.getByTestId("modal-confirm")).toHaveCount(0);
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("brand-name-field")).toContainText("Marca local");
      await expect(page.locator(".ui.active.dimmer")).toHaveCount(0);
      assert.deepEqual(await page.evaluate(() => window.storageOps), []);
      assert.equal(requests.filter(r => r.account === "finite-brand-admin" && r.method === "DELETE").length, 0);
    });
    await scenario("brand-readonly", "/marcas/CG", 0, async page => {
      await expect(page.getByTestId("brand-name-field")).toContainText("Marca local");
      await expect(page.getByTestId("nav-action-eliminar marca")).toHaveCount(0);
    }, "user");
    await scenario("supplier-admin", "/proveedores/01", 0, async page => {
      await expect(page.getByTestId("supplier-name-field")).toContainText("Proveedor local");
      await assertSupplierTools(page, false);
      assert.equal(requests.filter(r => r.account === "finite-supplier-admin" && r.entity === "products").length, 0);
      const button = page.getByTestId("nav-action-eliminar proveedor");
      await expect(button).toBeDisabled();
      await button.dispatchEvent("click");
      await expect(page.getByTestId("modal-confirm")).toHaveCount(0);
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("supplier-name-field")).toContainText("Proveedor local");
      assert.deepEqual(await page.evaluate(() => window.storageOps), []);
      assert.equal(requests.filter(r => r.account === "finite-supplier-admin" && r.method === "DELETE").length, 0);
    });
    await scenario("supplier-readonly", "/proveedores/01", 0, async page => {
      await expect(page.getByTestId("supplier-name-field")).toContainText("Proveedor local");
      await expect(page.getByTestId("nav-action-eliminar proveedor")).toHaveCount(0);
      await expect(page.getByTestId("nav-action-cargar productos del proveedor")).toHaveCount(0);
    }, "user");
    for (const [kind, route, field, label, list] of [
      ["brand", "/marcas/CG", "brand-name-field", "marca", "/marcas"],
      ["supplier", "/proveedores/01", "supplier-name-field", "proveedor", "/proveedores"],
    ]) {
      await scenario(`${kind}-unused`, route, 0, async page => {
        await expect(page.getByTestId(field)).toBeVisible();
        const account = `finite-${kind}-unused`;
        assert.equal(requests.filter(r => r.account === account && r.entity === "products").length, 0);
        if (kind === "supplier") await assertSupplierTools(page, true);
        await page.getByTestId(`nav-action-eliminar ${label}`).click();
        const confirmation = page.getByTestId("modal-confirmation-input").locator("input");
        await expect(confirmation).toBeVisible();
        assert.equal(requests.filter(r => r.account === account && r.entity === "products").length, 0);
        assert.equal(requests.filter(r => r.account === account && r.method === "DELETE").length, 0);
        await confirmation.fill("eliminar");
        await page.getByTestId("modal-confirm").click();
        await expect(page).toHaveURL(new RegExp(`${list}$`));
        assert.equal(requests.filter(r => r.account === account && r.method === "DELETE").length, 1);
      });
      for (const missing of ["missing-flag", "null-flag"]) {
        await scenario(`${kind}-${missing}`, route, 0, async page => {
          await expect(page.getByTestId(field)).toBeVisible();
          if (kind === "supplier") await assertSupplierTools(page, true);
          await expect(page.getByText("Información de productos asociados no disponible", { exact: true })).toBeVisible();
          const button = page.getByTestId(`nav-action-eliminar ${label}`);
          await expect(button).toBeDisabled();
          await button.dispatchEvent("click");
          await expect(page.getByTestId("modal-confirm")).toHaveCount(0);
          assert.equal(requests.filter(r => r.account === `finite-${kind}-${missing}` && r.method === "DELETE").length, 0);
          assert.deepEqual(await page.evaluate(() => window.storageOps), []);
          if (kind === "supplier") await expect(page.getByTestId("nav-action-stock/excel")).toBeEnabled();
        });
      }
    }
    const supplierRequests = name => requests.filter(r => r.account === `finite-${name}` && r.entity === "products");
    const downloadSupplierExcel = async page => {
      const pending = page.waitForEvent("download");
      await page.getByTestId("nav-action-descargar productos del proveedor").click();
      const file = await pending;
      const workbook = XLSX.readFile(await file.path());
      return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
    };
    await scenario("supplier-tools", "/proveedores/VA", 6, async page => {
      await expect(page.getByTestId("supplier-name-field")).toContainText("Proveedor local");
      assert.equal(supplierRequests("supplier-tools").length, 0);
      await expect(page.getByTestId("nav-action-cargar productos del proveedor")).toHaveCount(0);
      await page.getByTestId("nav-action-stock/excel").click();
      const rows = await downloadSupplierExcel(page);
      assert.equal(rows.length, 1201);
      assert.ok(rows.slice(1).every(row => row[0].startsWith("VA")));
      assert.deepEqual(supplierRequests("supplier-tools").map(r => r.params), [1, 2, 3].map(pageNumber => ({
        supplierId: "VA", pageNumber: String(pageNumber), pageSize: "500", count: String(pageNumber === 1),
      })));
      const pendingChooser = page.waitForEvent("filechooser");
      await page.getByRole("button", { name: "Cargar stock", exact: true }).click();
      const chooser = await pendingChooser;
      assert.equal(supplierRequests("supplier-tools").length, 3, "Stock must reuse Excel cache");
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([["Id", "Fecha", "Cantidad"], ["VACG01199", "15/10/2026", 1]]), "Stock");
      await chooser.setFiles({ name: "stock.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: XLSX.write(book, { type: "buffer", bookType: "xlsx" }) });
      const modal = page.locator(".ui.modal.visible");
      await expect(modal).toContainText("Movimientos a cargar: 1");
      await modal.getByRole("button", { name: "Aceptar", exact: true }).click();
      await expect(page.getByText("Stock cargado correctamente", { exact: true })).toBeVisible();
      await expect(modal).toHaveCount(0);
      assert.equal(supplierRequests("supplier-tools").length, 3, "Mutation invalidates without automatic product request");
      assert.equal((await downloadSupplierExcel(page)).length, 1201);
      assert.equal(supplierRequests("supplier-tools").length, 6, "Next tool reloads invalidated supplier cache");
      await page.getByTestId("nav-action-imprimir códigos de productos").click();
      await expect.poll(() => page.evaluate(() => window.printedProducts)).toBe(1200);
      await page.getByTestId("nav-action-eliminar todos los productos del proveedor").click();
      await expect(page.locator(".ui.modal.visible")).toContainText("1200 productos");
      await expect(page.getByTestId("nav-action-eliminar proveedor")).toBeDisabled();
      assert.deepEqual(await page.evaluate(() => window.storageOps), []);
    });
    await scenario("supplier-tools-missing-count", "/proveedores/VA", 1, async page => {
      await page.getByTestId("nav-action-stock/excel").click();
      await page.getByTestId("nav-action-descargar productos del proveedor").click();
      await expect(page.getByText(/response sin count\/total válido/)).toBeVisible();
      await expect(page.getByTestId("nav-action-stock/excel")).toBeEnabled();
      assert.deepEqual(await page.evaluate(() => window.storageOps.filter(op => /\.(put|clear|add|delete)$/.test(op))), []);
    });
    await scenario("supplier-tools-one-page", "/proveedores/VA", 1, async page => {
      await page.getByTestId("nav-action-stock/excel").click();
      assert.equal((await downloadSupplierExcel(page)).length, 501);
      assert.equal((await downloadSupplierExcel(page)).length, 501);
      assert.deepEqual(await page.evaluate(() => window.storageOps), []);
    });
    await scenario("supplier-tools-page-error", "/proveedores/VA", 5, async page => {
      let downloads = 0; page.on("download", () => downloads++);
      await page.getByTestId("nav-action-stock/excel").click();
      await page.getByTestId("nav-action-descargar productos del proveedor").click();
      await expect(page.getByText(/mock page 2 failed/)).toBeVisible();
      assert.equal(downloads, 0);
      assert.deepEqual(supplierRequests("supplier-tools-page-error").map(r => r.params.pageNumber), ["1", "2"]);
      recovered.add("finite-supplier-tools-page-error");
      assert.equal((await downloadSupplierExcel(page)).length, 1201);
      assert.equal(downloads, 1);
      assert.deepEqual(supplierRequests("supplier-tools-page-error").map(r => r.params.pageNumber), ["1", "2", "1", "2", "3"]);
    });
    await scenario("supplier-tools-stock-first", "/proveedores/VA", 3, async page => {
      await page.getByTestId("nav-action-stock/excel").click();
      assert.equal(supplierRequests("supplier-tools-stock-first").length, 0);
      const pending = page.waitForEvent("filechooser");
      await page.getByRole("button", { name: "Descontar stock", exact: true }).click();
      const chooser = await pending;
      assert.equal(supplierRequests("supplier-tools-stock-first").length, 3);
      await chooser.setFiles([]);
      assert.equal((await downloadSupplierExcel(page)).length, 1201);
      assert.deepEqual(await page.evaluate(() => window.storageOps), []);
    });
    await scenario("supplier-tools-stock-page-error", "/proveedores/VA", 5, async page => {
      let choosers = 0; page.on("filechooser", () => choosers++);
      await page.getByTestId("nav-action-stock/excel").click();
      await page.getByRole("button", { name: "Cargar stock", exact: true }).click();
      await expect(page.getByText(/mock page 2 failed/)).toBeVisible();
      assert.equal(choosers, 0, "Failed load must not continue to file selection");
      assert.deepEqual(supplierRequests("supplier-tools-stock-page-error").map(r => r.params.pageNumber), ["1", "2"]);
      recovered.add("finite-supplier-tools-stock-page-error");
      const pending = page.waitForEvent("filechooser");
      await page.getByRole("button", { name: "Cargar stock", exact: true }).click();
      await (await pending).setFiles([]);
      assert.equal(choosers, 1);
      assert.equal((await downloadSupplierExcel(page)).length, 1201);
      assert.deepEqual(await page.evaluate(() => window.storageOps), []);
    });
    await scenario("deliveries", "/ventas/CONFIRMED1", 3, async page => {
      await page.getByText("Entregas", { exact: true }).click();
      await expect.poll(() => requests.filter(r => r.account === "finite-deliveries" && r.entity === "products").length).toBe(3);
      await expect.poll(() => page.evaluate(() => window.storageOps.some(op => op === "products.put"))).toBe(true);
      await expect(page.getByTestId("budget-open-delivery-modal-button")).toBeVisible();
    });
    await scenario("list", "/productos", 1, async page => {
      await expect(page.getByTestId("table-row")).toHaveCount(20);
      assert.deepEqual(await page.evaluate(() => window.storageOps), []);
      const productRequests = requests.filter(r => r.account === "finite-list" && r.entity === "products");
      assert.equal(productRequests[0].params.pageSize, "20");
    });
  } finally {
    fs.writeFileSync(path.join(os.tmpdir(), "callixto-finite-catalog-requests.json"), JSON.stringify(requests, null, 2));
    await browser?.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
