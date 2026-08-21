const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("account budget branding registry contains declarative account logos", () => {
  const branding = read("src", "components", "budgets", "PDFfile", "accountBudgetBranding.js");

  assert.match(branding, /const ACCOUNT_BUDGET_BRANDING = \{\s*callixto: \{\s*src: "\/branding\/logo-callixto\.png",\s*alt: "Callixto",\s*width: 160,\s*height: 50,\s*\},/s);
  assert.match(branding, /"facundo-attili": \{\s*src: "\/accounts\/facundo-attili\.png",\s*alt: "Facundo Attili",\s*width: 160,\s*height: 50,\s*showCustomPDFDisclaimer: true,\s*\},/s);
  assert.match(branding, /"maderera-las-tapias": \{\s*src: "\/accounts\/maderera-las-tapias\.png",\s*alt: "Maderera Las Tapias",\s*width: 160,\s*height: 50,\s*showCustomPDFDisclaimer: true,\s*\},/s);
  assert.doesNotMatch(branding, /const (MADERERA_LAS_TAPIAS|FACUNDO_ATTILI|CALLIXTO)_BUDGET_LOGO/);
});

test("account budget logo resolver priority is explicit URL, local registry, then null", () => {
  const branding = read("src", "components", "budgets", "PDFfile", "accountBudgetBranding.js");

  assert.match(branding, /if \(isValidLogoUrl\(logoUrl\)\) \{\s*return \{\s*src: logoUrl,\s*alt,\s*width,\s*height,\s*\};\s*\}/s);
  assert.match(branding, /return ACCOUNT_BUDGET_BRANDING\[accountId\] \?\? null/);
  assert.match(branding, /\^https\?:\\\/\\\//);
  assert.match(branding, /logoUrl\.startsWith\("\/"\)/);
  assert.doesNotMatch(branding, /(MADERERA_LAS_TAPIAS|FACUNDO_ATTILI|CALLIXTO)_BUDGET_LOGO\s*;/);
});

test("public budget page uses public account id first and falls back to route accountId", () => {
  const publicPage = read("src", "app", "(public)", "public", "budgets", "[accountId]", "[publicHash]", "page.jsx");

  assert.match(publicPage, /id:\s*publicBudget\?\.account\?\.id\s*\?\?\s*params\?\.accountId/);
  assert.match(publicPage, /account=\{account\}/);
  assert.doesNotMatch(publicPage, /UserProvider|useUserContext|getSelectedAccountId/);
});

test("PDFfile renders image only when resolver returns logo config", () => {
  const pdfFile = read("src", "components", "budgets", "PDFfile", "index.js");

  assert.match(pdfFile, /customerPdf\s*&&\s*accountBudgetLogo\s*&&\s*\(/);
  assert.match(pdfFile, /src=\{accountBudgetLogo\.src\}/);
  assert.match(pdfFile, /alt=\{accountBudgetLogo\.alt\}/);
  assert.match(pdfFile, /width=\{accountBudgetLogo\.width\}/);
  assert.match(pdfFile, /height=\{accountBudgetLogo\.height\}/);
  assert.doesNotMatch(pdfFile, /maderera-las-tapias|account\?\.id\s*===|callixto/);
});
