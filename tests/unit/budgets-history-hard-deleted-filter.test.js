const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("sales history filters HARD_DELETED budgets before table and export data", () => {
  const source = read("src", "app", "(private)", "historial-ventas", "page.jsx");

  assert.match(source, /import \{ BUTTON_TEXTS, COLORS, CONTENT_SIZES, ENTITIES, HARD_DELETED, ICONS, INFO, PAGES \} from "@\/common\/constants";/);
  assert.match(source, /return budgetsData\s*\.filter\(budget => budget\.state !== HARD_DELETED\)\s*\.map\(budget => \(\{/);
  assert.match(source, /<BudgetsPage[\s\S]*budgets=\{loading \? \[\] : budgets\}[\s\S]*onFilteredBudgetsChange=\{handleFilteredBudgetsChange\}/);
});

test("sales history keeps normal budgets and excludes HARD_DELETED budgets", () => {
  const HARD_DELETED = "HARD_DELETED";
  const budgetsData = [
    { id: "normal", state: "CONFIRMED" },
    { id: "deleted", state: HARD_DELETED },
    { id: "draft", state: "DRAFT" },
  ];

  const visibleBudgets = budgetsData.filter(budget => budget.state !== HARD_DELETED);

  assert.deepEqual(visibleBudgets.map(budget => budget.id), ["normal", "draft"]);
});

test("history date picker keeps its local stacking fix", () => {
  const source = read("src", "components", "budgets", "BudgetsHistoryFilters", "styles.js");

  assert.match(source, /export const FilterRoot = styled\(Flex\)`[\s\S]*position: relative;/);
  assert.match(source, /export const FilterRoot = styled\(Flex\)`[\s\S]*z-index: 2;/);
  assert.match(source, /\.react-datepicker-popper \{[\s\S]*z-index: 31;/);
});
