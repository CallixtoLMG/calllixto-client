const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("CommentTooltip keeps its public props and delegates to IconTooltip", () => {
  const source = read("src", "common", "components", "tooltips", "CommentTooltip.jsx");

  assert.match(source, /export const CommentTooltip = \(\{ comment, \$tooltip, lineHeight, \$lowTooltip \}\) =>/);
  assert.match(source, /import \{ IconTooltip \} from '\.\/IconTooltip';/);
  assert.doesNotMatch(source, /from 'semantic-ui-react'/);
  assert.doesNotMatch(source, /<Popup/);
  assert.match(source, /<IconTooltip/);
  assert.match(source, /content=\{comment\}/);
});

test("CommentTooltip preserves visual settings", () => {
  const source = read("src", "common", "components", "tooltips", "CommentTooltip.jsx");

  assert.match(source, /size="mini"/);
  assert.match(source, /icon=\{ICONS\.INFO_CIRCLE\}/);
  assert.match(source, /color=\{COLORS\.BLUE\}/);
  assert.match(source, /position=\{POPUP_POSITIONS\.RIGHT_CENTER\}/);
  assert.match(source, /ariaLabel="Comentario"/);
});

test("CommentTooltip preserves icon spacing and vertical offset controls", () => {
  const source = read("src", "common", "components", "tooltips", "CommentTooltip.jsx");

  assert.match(source, /iconProps=\{\{[\s\S]*fontSize: "larger"/);
  assert.match(source, /margin: "0px"/);
  assert.match(source, /\$lowTooltip,/);
  assert.match(source, /\$tooltip,/);
  assert.match(source, /\$lineHeight: lineHeight/);
});

test("CommentTooltip keeps previous empty comment behavior", () => {
  const source = read("src", "common", "components", "tooltips", "CommentTooltip.jsx");

  assert.doesNotMatch(source, /if \(!comment\)/);
  assert.doesNotMatch(source, /return null/);
  assert.match(source, /content=\{comment\}/);
});

test("CommentTooltip callers remain unchanged", () => {
  const callers = [
    read("src", "components", "budgets", "budgets.constants.js"),
    read("src", "components", "budgets", "BudgetView", "BudgetDetails", "index.jsx"),
    read("src", "components", "products", "products.constants.js"),
    read("src", "components", "customers", "customers.constants.js"),
    read("src", "components", "suppliers", "suppliers.constants.js"),
    read("src", "components", "brands", "brands.constants.js"),
    read("src", "components", "expenses", "expenses.constants.js"),
    read("src", "components", "cashBalances", "cashBalances.constants.js"),
    read("src", "components", "users", "users.constants.js"),
  ].join("\n");

  assert.match(callers, /<CommentTooltip \$lowTooltip comment=\{budget\.comments\} \/>/);
  assert.match(callers, /<CommentTooltip tooltip="true" comment=\{comments\} \/>/);
  assert.match(callers, /<CommentTooltip \$tooltip comment=\{cashBalance\.comments\} \/>/);
  assert.match(callers, /<CommentTooltip lineHeight="normal" comment=\{product\.comments\} \/>/);
  assert.match(callers, /<CommentTooltip comment=\{brand\.comments\} \/>/);
});
