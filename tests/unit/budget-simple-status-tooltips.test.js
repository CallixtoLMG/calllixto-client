const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("budget paid indicator delegates simple popup icon infrastructure", () => {
  const source = read("src", "components", "budgets", "budgets.constants.js");

  assert.match(source, /import \{ CommentTooltip, IconTooltip \} from "\.\.\/\.\.\/common\/components\/tooltips";/);
  assert.match(source, /\{isPaid && \(/);
  assert.match(source, /<IconTooltip[\s\S]*content="Pagado"/);
  assert.match(source, /icon=\{ICONS\.DOLLAR\}/);
  assert.match(source, /color=\{COLORS\.GREEN\}/);
  assert.match(source, /position=\{POPUP_POSITIONS\.RIGHT_CENTER\}/);
  assert.match(source, /size="mini"/);
  assert.match(source, /ariaLabel="Pagado"/);
  assert.match(source, /iconProps=\{\{[\s\S]*margin: undefined/);
  assert.match(source, /\$lineHeight: undefined/);
  assert.match(source, /\$pointer: false/);
});

test("budget deliveries complete indicator delegates simple popup icon infrastructure", () => {
  const source = read("src", "components", "budgets", "budgets.constants.js");

  assert.match(source, /\{isCompleted && \(/);
  assert.match(source, /<IconTooltip[\s\S]*content="Entrega completa"/);
  assert.match(source, /icon=\{ICONS\.CHECK\}/);
  assert.match(source, /color=\{COLORS\.GREEN\}/);
  assert.match(source, /position=\{POPUP_POSITIONS\.RIGHT_CENTER\}/);
  assert.match(source, /size="mini"/);
  assert.match(source, /ariaLabel="Entrega completa"/);
  assert.match(source, /\$lowTooltip: true/);
  assert.match(source, /margin: undefined/);
  assert.match(source, /\$lineHeight: undefined/);
  assert.match(source, /\$pointer: false/);
});

test("create budget deliveries complete indicator delegates simple popup icon infrastructure", () => {
  const source = read("src", "components", "budgets", "CreateBudgetDeliveriesForm", "index.jsx");

  assert.match(source, /import \{ IconTooltip \} from "@\/common\/components\/tooltips";/);
  assert.match(source, /\{isCompleted && \(/);
  assert.match(source, /<IconTooltip[\s\S]*content="Entrega completa"/);
  assert.match(source, /icon=\{ICONS\.CHECK\}/);
  assert.match(source, /color=\{COLORS\.GREEN\}/);
  assert.match(source, /position=\{POPUP_POSITIONS\.RIGHT_CENTER\}/);
  assert.match(source, /size="mini"/);
  assert.match(source, /ariaLabel="Entrega completa"/);
  assert.match(source, /\$lowTooltip: true/);
  assert.match(source, /margin: undefined/);
  assert.match(source, /\$lineHeight: undefined/);
  assert.match(source, /\$pointer: false/);
});

test("simple budget status indicators remove direct Popup Icon triggers", () => {
  const budgetsSource = read("src", "components", "budgets", "budgets.constants.js");
  const createDeliveriesSource = read("src", "components", "budgets", "CreateBudgetDeliveriesForm", "index.jsx");

  assert.doesNotMatch(budgetsSource, /<Popup[\s\S]*content="Pagado"[\s\S]*<Icon[\s\S]*ICONS\.DOLLAR/);
  assert.doesNotMatch(budgetsSource, /<Popup[\s\S]*content="Entrega completa"[\s\S]*<Icon[\s\S]*ICONS\.CHECK/);
  assert.doesNotMatch(createDeliveriesSource, /<Popup[\s\S]*content="Entrega completa"[\s\S]*<Icon[\s\S]*ICONS\.CHECK/);
  assert.doesNotMatch(createDeliveriesSource, /from "semantic-ui-react"/);
  assert.doesNotMatch(createDeliveriesSource, /Flex, FlexColumn, Icon/);
});
