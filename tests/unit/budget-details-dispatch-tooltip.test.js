const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("BudgetDetails dispatch comment tooltip delegates to IconTooltip", () => {
  const source = read("src", "components", "budgets", "BudgetView", "BudgetDetails", "index.jsx");

  assert.match(source, /import \{ CommentTooltip, IconTooltip, TagsTooltip \} from "@\/common\/components\/tooltips";/);
  assert.match(source, /\{product\.dispatchComment && \(/);
  assert.match(source, /<IconTooltip[\s\S]*content=\{product\.dispatchComment\}/);
  assert.match(source, /icon=\{ICONS\.TRUCK\}/);
  assert.match(source, /color=\{COLORS\.ORANGE\}/);
  assert.match(source, /position=\{POPUP_POSITIONS\.TOP_CENTER\}/);
  assert.match(source, /size="mini"/);
  assert.match(source, /ariaLabel="Comentario de despacho"/);
});

test("BudgetDetails dispatch comment tooltip preserves icon-specific props", () => {
  const source = read("src", "components", "budgets", "BudgetView", "BudgetDetails", "index.jsx");

  assert.match(source, /iconProps=\{\{[\s\S]*margin: undefined/);
  assert.match(source, /\$lineHeight: undefined/);
  assert.match(source, /\$pointer: false/);
});

test("BudgetDetails removes only the dispatch truck Popup", () => {
  const source = read("src", "components", "budgets", "BudgetView", "BudgetDetails", "index.jsx");

  assert.doesNotMatch(
    source,
    /<Popup[\s\S]*content=\{product\.dispatchComment\}[\s\S]*trigger=\{<Icon name=\{ICONS\.TRUCK\} color=\{COLORS\.ORANGE\} \/>\}/
  );
  assert.match(source, /<Popup[\s\S]*content=\{product\.supplierName\}/);
  assert.match(source, /<Popup[\s\S]*content=\{product\.brandName\}/);
});
