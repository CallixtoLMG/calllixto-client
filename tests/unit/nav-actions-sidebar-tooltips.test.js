const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");
const { chromium } = require("@playwright/test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("sidebar shows full labels and disabled reasons with real desktop and mobile tooltips", async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await page.setContent('<meta name="viewport" content="width=device-width"><div id="root"></div>');
  const css = fs.readFileSync(require.resolve("semantic-ui-css/semantic.min.css"), "utf8").replace(/@import url\(https:\/\/fonts\.googleapis\.com[^)]*\);/, "");
  await page.addStyleTag({ content: css });
  for (const file of [
    "react/umd/react.development.js", "react-dom/umd/react-dom.development.js",
    "semantic-ui-react/dist/umd/semantic-ui-react.min.js", "styled-components/dist/styled-components.js",
  ]) await page.addScriptTag({ path: path.join(root, "node_modules", file) });
  const compile = (file) => ts.transpileModule(read(...file.split("/")), {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  await page.evaluate(({ rail, flex, semantic }) => {
    const React = window.React;
    const h = React.createElement;
    const ui = window.semanticUIReact;
    const constants = {
      COLORS: { BLUE: "blue", RED: "red" },
      ICONS: { CARET_UP: "caret up", CARET_DOWN: "caret down" },
      POPUP_POSITIONS: { LEFT_CENTER: "left center", BOTTOM_CENTER: "bottom center" },
      SIZES: { TINY: "tiny" },
    };
    const modules = {
      react: React, "styled-components": window.styled, "semantic-ui-react": ui,
      "react/jsx-runtime": { jsx: (type, props, key) => h(type, { ...props, key }), jsxs: (type, props, key) => h(type, { ...props, key }), Fragment: React.Fragment },
      "@/common/constants": constants, "@/common/constants/semantic": { CONTENT_SIZES: { FIT: "fit-content" } },
      "../../common/components/buttons": {},
    };
    const load = (code) => {
      const loaded = { exports: {} };
      new Function("module", "exports", "require", code)(loaded, loaded.exports, (name) => modules[name]);
      return loaded.exports;
    };
    modules["@/common/components/custom"] = { ...load(flex), ...load(semantic) };
    const { NavActions, NavActionsProvider, useNavActionsContext } = load(rail);
    window.disabledClicks = 0;
    const disabled = (id, text, tooltip) => ({
      id, icon: "trash", text, tooltip, disabled: true, onClick: () => { window.disabledClicks++; },
    });
    const StockButton = ({ triggerClassName }) => h(ui.Button, { className: triggerClassName },
      h(ui.Icon, { name: "upload" }), h("span", null, "Cargar stock del proveedor"));
    const actions = [
      { id: "print", icon: "barcode", text: "Imprimir códigos de productos" },
      { id: "state", icon: "pause", text: "Desactivar proveedor" },
      { id: "stock", icon: "file excel", text: "Stock/Excel", items: [{ id: "upload", text: "Cargar stock del proveedor", button: h(StockButton) }] },
      { id: "remove", icon: "list", text: "Eliminar todos los productos del proveedor" },
      disabled("supplier", "Eliminar proveedor", "No se puede eliminar este proveedor, existen productos asociados."),
      disabled("brand", "Eliminar marca", "No se puede eliminar esta marca, existen productos asociados."),
    ];
    const Fixture = ({ expanded, mobile, loading }) => {
      const { setActions } = useNavActionsContext();
      React.useEffect(() => setActions([...actions, {
        id: "download-excel", icon: "file excel", text: "Descargar Excel", loading, disabled: loading,
      }]), [setActions, loading]);
      return h("div", { "data-layout": expanded ? (mobile ? "mobile" : "expanded") : "collapsed",
        style: { width: expanded ? (mobile ? 308 : 208) : 36, margin: "48px 12px 0 auto" } },
        h(NavActions, { variant: expanded ? "sidebar-expanded" : "sidebar-collapsed", disableActionTooltips: mobile }));
    };
    const root = window.ReactDOM.createRoot(document.querySelector("#root"));
    window.renderRail = (expanded, mobile = false, loading = false) =>
      root.render(h(NavActionsProvider, null, h(Fixture, { expanded, mobile, loading })));
    window.renderRail(true);
  }, {
    rail: compile("src/components/layout/NavActions.jsx"),
    flex: compile("src/common/components/custom/Flex.jsx"),
    semantic: compile("src/common/components/custom/Semantic.jsx"),
  });

  const popup = page.locator(".ui.popup.visible");
  const button = (name) => page.getByRole("button", { name, exact: true });
  const resetPointer = async () => {
    await page.mouse.move(5, 5);
    await popup.waitFor({ state: "hidden" });
  };
  const hoverLabel = async (name, reason) => {
    const target = reason ? button(name).locator("../..") : button(name);
    await target.hover();
    await popup.getByText(name, { exact: true }).waitFor();
    if (reason) await popup.getByText(/existen productos asociados/).waitFor();
    await resetPointer();
  };
  await hoverLabel("Imprimir códigos de productos");
  await hoverLabel("Eliminar todos los productos del proveedor");
  await button("Stock/Excel").click();
  await hoverLabel("Cargar stock del proveedor");
  await hoverLabel("Eliminar proveedor", true);
  await hoverLabel("Eliminar marca", true);
  await page.evaluate(() => window.renderRail(false));
  await hoverLabel("Imprimir códigos de productos");
  await hoverLabel("Eliminar proveedor", true);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.renderRail(true, true));
  await button("Eliminar proveedor").locator("../..").click();
  await popup.getByText(/existen productos asociados/).waitFor();
  assert.equal(await button("Eliminar proveedor").isDisabled(), true);
  assert.equal(await page.evaluate(() => window.disabledClicks), 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
  await page.mouse.click(5, 5);
  const excel = button("Descargar Excel");
  for (const [width, expanded, mobile] of [[1366, false, false], [390, true, true]]) {
    await page.setViewportSize({ width, height: 844 });
    const render = (loading) => page.evaluate(({ expanded, mobile, loading }) =>
      window.renderRail(expanded, mobile, loading), { expanded, mobile, loading });
    await render(false);
    await page.locator(`[data-layout="${mobile ? "mobile" : "collapsed"}"]`).waitFor();
    const icon = excel.locator(".file.excel.icon");
    await icon.waitFor({ state: "visible" });
    const bounds = await excel.boundingBox();
    await render(true);
    await excel.and(page.locator(".loading")).waitFor();
    assert.equal(await icon.count(), 0);
    assert.equal(await excel.isDisabled(), true);
    assert.equal(await excel.evaluate((button) => getComputedStyle(button, "::after").animationName), "button-spin");
    if (expanded) assert.equal(await excel.getByText("Descargar Excel").isVisible(), false);
    assert.deepEqual(await excel.boundingBox(), bounds);
    await render(false);
    await icon.waitFor({ state: "visible" });
    assert.equal(await excel.isEnabled(), true);
  }
});

test("list rails omit manual refresh and keep the product Excel update", () => {
  const sources = [
    ["components", "users", "UserPage", "index.jsx"],
    ["components", "cashBalances", "CashBalancesPage", "index.jsx"],
    ["components", "layout", "useListPageSideActions.jsx"],
    ["common", "components", "table", "Filters.jsx"],
  ].map((segments) => read("src", ...segments));
  for (const source of sources) {
    assert.doesNotMatch(source, /quick-update|hard-update|Actualización (rápida|completa)|useRestoreEntity|onRefetch/);
  }
  for (const source of sources.slice(0, 2)) {
    assert.match(source, /<Filters\s/);
    assert.match(source, /onDownloadExcel/);
  }
  for (const route of ["clientes", "proveedores", "marcas", "productos", "ventas", "gastos", "usuarios", "cajas", "configuracion"]) {
    const source = read("src", "app", "(private)", route, "page.jsx");
    assert.doesNotMatch(source, /text:\s*["']Actualizar (clientes|proveedores|marcas|productos|ventas|gastos|usuarios|cajas|configuración)["']|ICONS\.REFRESH/, route);
  }
  const productsPage = read("src", "app", "(private)", "productos", "page.jsx");
  assert.match(productsPage, /<BatchImportProducts key="batch-update"\s*\/>/);
});

test("sales sidebar uses specific Excel label without old generic text", () => {
  const budgetsPage = read("src", "app", "(private)", "ventas", "page.jsx");

  assert.match(budgetsPage, /text: "Descargar ventas en Excel"/);
  assert.match(budgetsPage, /text: "Descargar ventas en Excel"[\s\S]*showTooltipWhenExpanded: true/);
  assert.doesNotMatch(budgetsPage, /text: "Descargar Excel"/);
});

test("requested expanded tooltip exceptions are opt-in on action definitions", () => {
  const useListPageSideActions = read("src", "components", "layout", "useListPageSideActions.jsx");
  const suppliersPage = read("src", "app", "(private)", "proveedores", "page.jsx");
  const productsListPage = read("src", "app", "(private)", "productos", "page.jsx");
  const productDetailPage = read("src", "app", "(private)", "productos", "[id]", "page.client.jsx");
  const saleDetailPage = read("src", "app", "(private)", "ventas", "[id]", "page.client.jsx");

  assert.match(useListPageSideActions, /text: downloadTooltip \|\| "Descargar Excel"[\s\S]*showTooltipWhenExpanded: true/);
  assert.match(suppliersPage, /text: "Descargar proveedores en Excel"[\s\S]*showTooltipWhenExpanded: true/);
  assert.match(productsListPage, /text: "Descargar plantilla de productos"[\s\S]*showTooltipWhenExpanded: true/);
  assert.match(productDetailPage, /text: "Imprimir código de barras"[\s\S]*showTooltipWhenExpanded: true/);
  assert.match(productDetailPage, /isProductOOS\(product\?\.state\) \? "Actualizar a con stock" : "Actualizar a sin stock"/);
  assert.match(productDetailPage, /text: isProductOOS\(product\?\.state\) \? "Actualizar a con stock" : "Actualizar a sin stock"[\s\S]*showTooltipWhenExpanded: true/);
  assert.match(saleDetailPage, /collapsedTooltip: `Enviar venta por \$\{channelText\} a \$\{text\}`,[\s\S]*showTooltipWhenExpanded: true/);
  assert.match(saleDetailPage, /text: 'Descargar PDF de la venta'[\s\S]*showTooltipWhenExpanded: true/);
});
