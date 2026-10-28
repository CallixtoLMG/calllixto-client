const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("sales history passes the complete backend page to table and export", () => {
  const source = read("src", "app", "(private)", "historial-ventas", "page.jsx");

  assert.match(source, /return budgetsData\.budgets\s*\.map\(budget => \(\{/);
  assert.doesNotMatch(source, /\.filter\(budget/);
  assert.match(source, /<BudgetsPage[\s\S]*budgets=\{loading \? \[\] : budgets\}[\s\S]*onFilteredBudgetsChange=\{handleFilteredBudgetsChange\}/);
});

test("history date picker keeps its local stacking fix", () => {
  const source = read("src", "components", "budgets", "BudgetsHistoryFilters", "styles.js");

  assert.match(source, /export const FilterRoot = styled\(Flex\)`[\s\S]*position: relative;/);
  assert.match(source, /export const FilterRoot = styled\(Flex\)`[\s\S]*z-index: 2;/);
  assert.match(source, /\.react-datepicker-popper \{[\s\S]*z-index: 31;/);
});
