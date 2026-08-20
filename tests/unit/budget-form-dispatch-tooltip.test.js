const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("BudgetForm dispatch comment warning delegates simple popup icon infrastructure", () => {
  const source = read("src", "components", "budgets", "BudgetForm", "index.jsx");

  assert.match(source, /import \{ AddressesTooltip, CommentTooltip, IconTooltip, PhonesTooltip, TagsTooltip \} from "@\/common\/components\/tooltips";/);
  assert.match(source, /\{\(!!product\.dispatchComment \|\| !!product\?\.dispatch\?\.comment\) && \(/);
  assert.match(source, /<IconTooltip[\s\S]*content=\{product\.dispatchComment \|\| product\?\.dispatch\?\.comment\}/);
  assert.match(source, /icon=\{ICONS\.TRUCK\}/);
  assert.match(source, /color=\{COLORS\.BLUE\}/);
  assert.match(source, /position=\{POPUP_POSITIONS\.TOP_CENTER\}/);
  assert.match(source, /size="mini"/);
  assert.match(source, /ariaLabel="Comentario de despacho"/);
});

test("BudgetForm dispatch comment tooltip preserves icon line-height and default cursor", () => {
  const source = read("src", "components", "budgets", "BudgetForm", "index.jsx");

  assert.match(source, /iconProps=\{\{[\s\S]*lineHeight: "normal"/);
  assert.match(source, /\$lineHeight: "normal"/);
  assert.match(source, /margin: undefined/);
  assert.match(source, /\$pointer: false/);
});

test("BudgetForm dispatch comment tooltip removes only the direct truck Popup trigger", () => {
  const source = read("src", "components", "budgets", "BudgetForm", "index.jsx");

  assert.doesNotMatch(
    source,
    /<Popup size="mini" content=\{product\.dispatchComment \|\| product\?\.dispatch\?\.comment\} position=\{POPUP_POSITIONS\.TOP_CENTER\} trigger=\{<Icon lineHeight="normal" name=\{ICONS\.TRUCK\} color=\{COLORS\.BLUE\} \/>\} \/>/
  );
  assert.match(source, /<Popup[\s\S]*content=\{product\.supplierName\}/);
  assert.match(source, /<Popup[\s\S]*content=\{product\.brandName\}/);
});
