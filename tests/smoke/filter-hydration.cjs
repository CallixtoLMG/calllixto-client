// Requires isolated Next dev at 3107 with NEXT_PUBLIC_URL=http://127.0.0.1:3108/.
// All browser API traffic is fulfilled locally; no live backend or writes.
const { chromium, expect } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const base = "http://127.0.0.1:3107";
const api = "http://127.0.0.1:3108";
const report = [];
const user = { roles: ["sadmin"], accountId: "hydration-smoke", name: "Prueba Local", isAuthorized: true };
const cookies = [{ name: "token", value: "local-mock", url: base },
  { name: "userData", value: encodeURIComponent(Buffer.from(JSON.stringify(user)).toString("base64")), url: base }];
const products = Array.from({ length: 347 }, (_, index) => ({
  id: `01CG${String(index).padStart(5, "0")}`, name: `Producto local ${index}`, state: "ACTIVE", cost: 10, price: 20,
}));
const selectedSize = (page, value) => page.locator(".ui.selection.dropdown > .text").filter({ hasText: new RegExp(`^${value}$`) });

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const ssr = await browser.newContext({ javaScriptEnabled: false });
    try {
      await ssr.addCookies(cookies);
      const page = await ssr.newPage();
      await page.goto(`${base}/productos`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await expect(selectedSize(page, 20)).toBeVisible();
      console.log("PASS server HTML: page-size dropdown = 20 with JavaScript disabled");
    } finally { await ssr.close(); }

    const cases = [
      { name: "saved-100", saved: { pageSize: 100 }, size: 100, page: 1 },
      { name: "no-preference", size: 20, page: 1 },
      { name: "saved-page-sort", saved: { pageSize: 100, page: 2, name: "Guardado", sorting: { key: "name", direction: "ascending" } },
        size: 100, page: 2, sort: "name", order: "true", nameFilter: "Guardado" },
    ];
    for (const scenario of cases) {
      const context = await browser.newContext();
      let watchdog;
      const requests = [], errors = [], hydrationMessages = [];
      try {
        await context.addCookies(cookies);
        await context.addInitScript(({ saved }) => {
          localStorage.setItem("latestNews", "2026-09-21");
          if (saved) localStorage.setItem("productsFilters", JSON.stringify(saved));
          window.storageOps = [];
          for (const method of ["get", "getAll", "put", "clear", "openCursor"]) {
            const original = IDBObjectStore.prototype[method];
            IDBObjectStore.prototype[method] = function (...args) {
              window.storageOps.push(`${this.name}.${method}`);
              return original.apply(this, args);
            };
          }
        }, { saved: scenario.saved });
        const page = await context.newPage();
        page.on("pageerror", error => errors.push(error.message));
        page.on("console", message => {
          if (/hydrati|did not match|does not match|server.rendered|server HTML/i.test(message.text())) hydrationMessages.push(message.text());
        });
        let fail;
        const aborted = new Promise((_, reject) => { fail = error => { context.close().catch(() => {}); reject(error); }; });
        watchdog = setTimeout(() => fail(new Error(`${scenario.name}: 30s watchdog`)), 30000);
        await context.route("**/*", async route => {
          const url = new URL(route.request().url());
          if (url.origin === base) return route.continue();
          if (url.origin !== api) return route.abort();
          if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204 });
          if (route.request().method() !== "GET") { fail(new Error("Unexpected API write")); return route.abort(); }
          const entity = url.pathname.split("/").at(-1);
          let body = { statusOk: true };
          if (entity === "products") {
            const params = Object.fromEntries(url.searchParams);
            requests.push(params);
            if (requests.length > 10) { fail(new Error("Products exceeded request cap 10")); return route.abort(); }
            const pageNumber = Number(params.pageNumber), size = Number(params.pageSize);
            body.products = products.slice((pageNumber - 1) * size, pageNumber * size);
            if (params.count === "true") body.count = products.length;
          } else if (entity === "settings") body.settings = [];
          else if (entity === "users") { body.users = []; body.count = 0; }
          else { fail(new Error(`Unexpected API endpoint: ${entity}`)); return route.abort(); }
          return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
        });
        await Promise.race([aborted, (async () => {
          for (const load of ["direct", "reload"]) {
            const before = requests.length;
            if (load === "direct") await page.goto(`${base}/productos`, { waitUntil: "domcontentloaded", timeout: 20000 });
            else await page.reload({ waitUntil: "domcontentloaded", timeout: 20000 });
            await expect(selectedSize(page, scenario.size)).toBeVisible();
            await expect(page.getByTestId("table-row")).toHaveCount(scenario.size);
            assert.equal(requests.length - before, 1, `${scenario.name}/${load}: exactly one initial request`);
            const params = requests.at(-1);
            assert.equal(params.pageSize, String(scenario.size));
            assert.equal(params.pageNumber, String(scenario.page));
            assert.equal(params.count, "true");
            assert.equal(params.sort, scenario.sort);
            assert.equal(params.order, scenario.order);
            assert.equal(params.name, scenario.nameFilter);
            if (scenario.nameFilter) await expect(page.locator('input[name="name"]')).toHaveValue(scenario.nameFilter);
            assert.deepEqual(await page.evaluate(() => window.storageOps), []);
            // Exercise a render without changing query params; draft stays unsubmitted.
            await page.locator('input[name="id"]').fill("Pendiente");
            assert.equal(requests.length - before, 1);
            assert.deepEqual(errors, []);
            assert.deepEqual(hydrationMessages, []);
            console.log(`PASS ${scenario.name}/${load}: UI ${scenario.size}, one GET size=${params.pageSize} page=${params.pageNumber}, zero hydration warnings/errors`);
          }
        })()]);
      } finally {
        clearTimeout(watchdog);
        report.push({ scenario: scenario.name, requests, errors, hydrationMessages });
        await context.close();
      }
    }
  } finally {
    fs.writeFileSync(path.join(os.tmpdir(), "callixto-hydration-smoke.json"), JSON.stringify(report, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
