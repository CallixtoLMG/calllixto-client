const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("sidebar tooltips depend on collapsed, disabled, and real truncation state", () => {
  const navActions = read("src", "components", "layout", "NavActions.jsx");

  assert.match(navActions, /const getDisabledActionTooltip = \(action, label\) =>/);
  assert.match(navActions, /if \(!action\.disabled\) return undefined/);
  assert.match(navActions, /getDisabledActionTooltip\(action, label\) \|\| action\.collapsedTooltip \|\| action\.tooltip \|\| action\.text \|\| action\.label/);
  assert.match(navActions, /action\.showTooltipWhenExpanded \? getForcedExpandedActionTooltip\(action\) : undefined/);
  assert.match(navActions, /isLabelTruncated \? label : undefined/);
  assert.match(navActions, /labelElement\.scrollWidth > labelElement\.clientWidth/);
  assert.match(navActions, /ResizeObserver/);
  assert.match(navActions, /isSidebarOpen\s*\?\s*getExpandedActionTooltip\(action, label, isLabelTruncated\)\s*:\s*getCollapsedActionTooltip\(action, label\)/);
});

test("sales sidebar uses specific Excel label without old generic text", () => {
  const budgetsPage = read("src", "components", "budgets", "BudgetsPage", "index.jsx");

  assert.match(budgetsPage, /text: "Descargar ventas en Excel"/);
  assert.match(budgetsPage, /text: "Descargar ventas en Excel"[\s\S]*showTooltipWhenExpanded: true/);
  assert.doesNotMatch(budgetsPage, /text: "Descargar Excel"/);
});

test("requested expanded tooltip exceptions are opt-in on action definitions", () => {
  const useListPageSideActions = read("src", "components", "layout", "useListPageSideActions.jsx");
  const suppliersPage = read("src", "components", "suppliers", "SuppliersPage", "index.jsx");
  const productsListPage = read("src", "app", "(private)", "productos", "page.jsx");
  const productDetailPage = read("src", "app", "(private)", "productos", "[id]", "page.client.jsx");
  const saleDetailPage = read("src", "app", "(private)", "ventas", "[id]", "page.client.jsx");
  const settingsPage = read("src", "app", "(private)", "configuracion", "page.jsx");
  const historyPage = read("src", "app", "(private)", "historial-ventas", "page.jsx");

  assert.match(useListPageSideActions, /text: downloadTooltip \|\| "Descargar Excel"[\s\S]*showTooltipWhenExpanded: true/);
  assert.match(suppliersPage, /showUpdateTooltipWhenExpanded: true/);
  assert.match(productsListPage, /text: "Descargar plantilla de productos"[\s\S]*showTooltipWhenExpanded: true/);
  assert.match(productDetailPage, /text: "Imprimir código de barras"[\s\S]*showTooltipWhenExpanded: true/);
  assert.match(productDetailPage, /isProductOOS\(product\?\.state\) \? "Actualizar a con stock" : "Actualizar a sin stock"/);
  assert.match(productDetailPage, /text: isProductOOS\(product\?\.state\) \? "Actualizar a con stock" : "Actualizar a sin stock"[\s\S]*showTooltipWhenExpanded: true/);
  assert.match(saleDetailPage, /collapsedTooltip: `Enviar venta por \$\{channelText\} a \$\{text\}`,[\s\S]*showTooltipWhenExpanded: true/);
  assert.match(saleDetailPage, /text: 'Descargar PDF de la venta'[\s\S]*showTooltipWhenExpanded: true/);
  assert.match(settingsPage, /text: "Actualizar configuración"[\s\S]*showTooltipWhenExpanded: true/);
  assert.match(historyPage, /text: "Descargar historial de ventas en Excel"[\s\S]*showTooltipWhenExpanded: true/);
});
