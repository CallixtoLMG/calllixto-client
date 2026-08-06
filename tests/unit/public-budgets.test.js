const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");
const exists = (...segments) => fs.existsSync(path.join(root, ...segments));

test("budget creation does not send obsolete per-budget publicEnabled flag", () => {
  const budgetsApi = read("src", "api", "budgets.js");

  assert.match(budgetsApi, /value:\s*budget/);
  assert.doesNotMatch(budgetsApi, /publicEnabled:\s*true|budget\.publicEnabled/);
});

test("public budget link uses settings publicEnabled and budget.publicHash without budget.publicEnabled", () => {
  const budgetDetail = read("src", "app", "(private)", "ventas", "[id]", "page.client.jsx");
  const constants = read("src", "common", "constants", "index.js");

  assert.match(budgetDetail, /budget\?\.publicHash/);
  assert.match(budgetDetail, /isPublicBudgetsEnabled\s*=\s*Boolean\(budgetSettings\?\.publicEnabled\)/);
  assert.match(budgetDetail, /Boolean\(isPublicBudgetsEnabled && accountId && publicHash\)/);
  assert.match(budgetDetail, /Los presupuestos públicos están deshabilitados en Configuración/);
  assert.match(budgetDetail, /Este presupuesto no tiene un enlace público disponible/);
  assert.match(budgetDetail, /if \(!canCopyPublicLink\)/);
  assert.doesNotMatch(budgetDetail, /budget\?\.publicEnabled|budget\.publicEnabled/);
  assert.doesNotMatch(budgetDetail, /budget\?\.hash|budget\?\.publicId|budget\?\.publicLink/);
  assert.match(budgetDetail, /disabled:\s*!canCopyPublicLink/);
  assert.match(budgetDetail, /PAGES\.PUBLIC\.BUDGETS\.SHOW\(accountId,\s*publicHash\)/);
  assert.match(constants, /SHOW:\s*\(accountId,\s*publicHash\)\s*=>/);
  assert.match(constants, /encodeURIComponent\(accountId\)/);
  assert.match(constants, /encodeURIComponent\(publicHash\)/);
});

test("public API consumes backend public endpoint without private axios interceptor", () => {
  const budgetsApi = read("src", "api", "budgets.js");

  assert.match(budgetsApi, /fetch\(`\$\{baseUrl\}\/\$\{PATHS\.BUDGETS\}\/public\/\$\{encodeURIComponent\(publicHash\)\}`\)/);
  assert.doesNotMatch(budgetsApi, /getInstance\(\)\.get\(`\$\{baseUrl\}\/\$\{PATHS\.BUDGETS\}\/public/);
});

test("public budget page fetches real data, keeps privacy flag, and avoids storage mock", () => {
  const publicPage = read("src", "app", "(public)", "public", "budgets", "[accountId]", "[publicHash]", "page.jsx");

  assert.match(publicPage, /getPublicBudget\(\{\s*accountId:\s*params\?\.accountId,\s*publicHash:\s*params\?\.publicHash,\s*\}\)/s);
  assert.match(publicPage, /hideSensitiveData/);
  assert.doesNotMatch(publicPage, /localStorage|sessionStorage|getPublicBudgetSnapshot|savePublicBudgetSnapshot/);
});

test("localStorage public budget mock file was removed", () => {
  assert.equal(exists("src", "components", "budgets", "publicBudget.mock.js"), false);
});

test("cloned budgets do not copy public hash or obsolete publicEnabled", () => {
  const budgetConstants = read("src", "components", "budgets", "budgets.constants.js");
  const cloneBlock = budgetConstants.slice(
    budgetConstants.indexOf("export const createClonedBudget"),
    budgetConstants.indexOf("export const getHourKey")
  );

  assert.doesNotMatch(cloneBlock, /publicHash|publicEnabled|\.\.\.budget/);
});
