const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("BudgetDetails post-confirm discount info delegates to IconTooltip", () => {
  const source = read("src", "components", "budgets", "BudgetView", "BudgetDetails", "index.jsx");

  assert.match(source, /import \{ CommentTooltip, IconTooltip, TagsTooltip \} from "@\/common\/components\/tooltips";/);
  assert.match(source, /\{isBudgetConfirmed\(budget\?\.state\) \?/);
  assert.match(source, /<IconTooltip[\s\S]*content="Permite aplicar un descuento una vez confirmada la venta"/);
  assert.match(source, /icon=\{ICONS\.INFO_CIRCLE\}/);
  assert.match(source, /color=\{COLORS\.BLUE\}/);
  assert.match(source, /position=\{POPUP_POSITIONS\.LEFT_CENTER\}/);
  assert.match(source, /size="mini"/);
  assert.match(source, /ariaLabel="Información sobre descuento"/);
  assert.match(source, /\{isBudgetConfirmed\(budget\?\.state\) \?[\s\S]*<IconTooltip[\s\S]*Permite aplicar un descuento una vez confirmada la venta[\s\S]*:\s*<Total/);
});

test("BudgetDetails post-confirm discount info preserves icon visual props", () => {
  const source = read("src", "components", "budgets", "BudgetView", "BudgetDetails", "index.jsx");

  assert.match(source, /iconProps=\{\{[\s\S]*fontSize: "larger"/);
  assert.match(source, /margin: undefined/);
  assert.match(source, /\$lineHeight: undefined/);
  assert.match(source, /\$pointer: false/);
});

test("BudgetDetails removes only the post-confirm discount info Popup", () => {
  const source = read("src", "components", "budgets", "BudgetView", "BudgetDetails", "index.jsx");

  assert.doesNotMatch(
    source,
    /<Popup[\s\S]*trigger=\{[\s\S]*<Icon\b[\s\S]*content="Permite aplicar un descuento una vez confirmada la venta"/
  );
  assert.doesNotMatch(source, /FormField, Icon, Input/);
  assert.match(source, /<Popup[\s\S]*content=\{product\.supplierName\}/);
  assert.match(source, /<Popup[\s\S]*content=\{product\.brandName\}/);
});
