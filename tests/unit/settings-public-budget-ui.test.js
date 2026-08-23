const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("settings budget general exposes and persists publicEnabled checkbox", () => {
  const generalSettings = read("src", "components", "settings", "Entities", "Budgets", "General", "index.jsx");
  const settingsConstants = read("src", "components", "settings", "settings.constants.js");

  assert.match(generalSettings, /name="publicEnabled"/);
  assert.match(generalSettings, /defaultValue=\{false\}/);
  assert.match(generalSettings, /checked=\{!!value\}/);
  assert.match(generalSettings, /Presupuesto público/);
  assert.match(generalSettings, /helpText=\{SETTINGS_HELP_TEXTS\.BUDGET_PUBLIC_ENABLED\}/);
  assert.match(generalSettings, /label=\{value \? "Habilitado" : "Deshabilitado"\}/);
  assert.match(generalSettings, /font-weight:\s*normal/);
  assert.match(settingsConstants, /BUDGET:\s*\[[^\]]*publicEnabled/);
  assert.match(settingsConstants, /BUDGET_PUBLIC_ENABLED:\s*"Habilita la posibilidad de compartir un presupuesto mediante enlaces públicos\."/);
  assert.doesNotMatch(settingsConstants, /TODO: incluir publicEnabled/);
});

test("settings budget history date ranges delete icon shows pointer cursor", () => {
  const historyRanges = read("src", "components", "settings", "Entities", "Budgets", "General", "HistoryDateRangesControlled.jsx");

  assert.match(historyRanges, /<Icon[\s\S]*\$pointer[\s\S]*name=\{ICONS\.TRASH\}[\s\S]*onClick=\{\(\) => remove\(index\)\}/);
  assert.doesNotMatch(historyRanges, /pointer="true"/);
});

test("sidebar actions use specific labels instead of redundant generic tooltips", () => {
  const files = [
    read("src", "app", "(private)", "ventas", "page.jsx"),
    read("src", "app", "(private)", "clientes", "page.jsx"),
    read("src", "app", "(private)", "proveedores", "page.jsx"),
    read("src", "app", "(private)", "productos", "page.jsx"),
    read("src", "app", "(private)", "marcas", "page.jsx"),
    read("src", "app", "(private)", "gastos", "page.jsx"),
    read("src", "app", "(private)", "cajas", "page.jsx"),
    read("src", "app", "(private)", "usuarios", "page.jsx"),
    read("src", "app", "(private)", "ventas", "[id]", "page.client.jsx"),
    read("src", "components", "budgets", "BudgetsPage", "index.jsx"),
  ].join("\n");

  [
    "Crear venta",
    "Historial de ventas",
    "Crear cliente",
    "Crear proveedor",
    "Crear producto",
    "Crear marca",
    "Crear gasto",
    "Abrir caja",
    "Crear usuario",
    "Copiar link público",
    "Descargar ventas en Excel",
  ].forEach((label) => assert.match(files, new RegExp(`text:\\s*['"]${label}['"]`)));

  assert.doesNotMatch(files, /text:\s*['"]Crear['"],\s*collapsedTooltip:\s*['"]Crear /);
  assert.doesNotMatch(files, /text:\s*['"]Historial['"],\s*collapsedTooltip:/);
  assert.doesNotMatch(files, /text:\s*['"]Copiar link público['"],\s*tooltip:\s*['"]Copiar/);
});

test("collapsed sidebar keeps automatic tooltip fallback from final action text", () => {
  const navActions = read("src", "components", "layout", "NavActions.jsx");

  assert.match(navActions, /action\.collapsedTooltip\s*\|\|\s*action\.tooltip\s*\|\|\s*action\.text\s*\|\|\s*action\.label/);
});

test("public budget PDF hides customer section and payments while private fields remain available", () => {
  const pdfFile = read("src", "components", "budgets", "PDFfile", "index.js");

  assert.match(pdfFile, /!\s*hideSensitiveData\s*&&\s*\(/);
  assert.match(pdfFile, /label="Cliente"/);
  assert.match(pdfFile, /label="Dirección"/);
  assert.match(pdfFile, /label="Teléfono"/);
  assert.match(pdfFile, /!\s*dispatchPdf\s*&&\s*!\s*hideSensitiveData/);
  assert.doesNotMatch(pdfFile, /SENSITIVE_VALUE/);
});

test("budget PDF renders account logo only when known public asset exists", () => {
  const pdfFile = read("src", "components", "budgets", "PDFfile", "index.js");
  const branding = read("src", "components", "budgets", "PDFfile", "accountBudgetBranding.js");

  assert.match(pdfFile, /resolveAccountBudgetLogo\(\{\s*accountId:\s*account\?\.id\s*\}\)/s);
  assert.match(pdfFile, /customerPdf\s*&&\s*accountBudgetLogo\s*&&\s*\(/);
  assert.match(pdfFile, /src=\{accountBudgetLogo\.src\}/);
  assert.doesNotMatch(pdfFile, /account\?\.id\s*===\s*['"]maderera-las-tapias['"]|account\?\.id\s*===\s*['"]callixto['"]/);
  assert.match(branding, /callixto: \{\s*src: "\/branding\/logo-callixto\.png"/s);
  assert.match(branding, /"facundo-attili": \{\s*src: "\/accounts\/facundo-attili\.png"/s);
  assert.match(branding, /"maderera-las-tapias": \{\s*src: "\/accounts\/maderera-las-tapias\.png"/s);
  assert.doesNotMatch(branding, /_BUDGET_LOGO/);
});
