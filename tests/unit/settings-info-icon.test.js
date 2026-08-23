const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("SettingsInfoIcon keeps its public content API and empty guard", () => {
  const source = read("src", "components", "settings", "Common", "SettingsInfoIcon.jsx");

  assert.match(source, /const SettingsInfoIcon = \(\{ content \}\) =>/);
  assert.match(source, /if \(!content\) return null;/);
});

test("SettingsInfoIcon delegates simple tooltip infrastructure to IconTooltip", () => {
  const source = read("src", "components", "settings", "Common", "SettingsInfoIcon.jsx");

  assert.match(source, /import \{ IconTooltip \} from "@\/common\/components\/tooltips";/);
  assert.doesNotMatch(source, /from "semantic-ui-react"/);
  assert.doesNotMatch(source, /<Popup/);
  assert.match(source, /<IconTooltip/);
  assert.match(source, /content=\{content\}/);
});

test("SettingsInfoIcon preserves visual tooltip settings", () => {
  const source = read("src", "components", "settings", "Common", "SettingsInfoIcon.jsx");

  assert.match(source, /icon=\{ICONS\.INFO_CIRCLE\}/);
  assert.match(source, /color=\{COLORS\.BLUE\}/);
  assert.match(source, /size=\{SIZES\.TINY\}/);
  assert.match(source, /position=\{POPUP_POSITIONS\.TOP_CENTER\}/);
  assert.match(source, /ariaLabel="Ayuda"/);
  assert.match(source, /iconProps=\{\{ margin: "0 0 0 8px" \}\}/);
});

test("SettingsInfoIcon preserves propagation guards on the IconTooltip trigger", () => {
  const source = read("src", "components", "settings", "Common", "SettingsInfoIcon.jsx");

  assert.match(source, /const stopAccordionToggle = \(event\) => \{/);
  assert.match(source, /event\.preventDefault\(\);/);
  assert.match(source, /event\.stopPropagation\(\);/);
  assert.match(source, /triggerProps=\{\{[\s\S]*onClick: stopAccordionToggle,[\s\S]*onMouseDown: stopAccordionToggle,[\s\S]*\}\}/);
});

test("SettingsInfoIcon does not create a second focusable trigger wrapper", () => {
  const source = read("src", "components", "settings", "Common", "SettingsInfoIcon.jsx");

  assert.doesNotMatch(source, /role="button"/);
  assert.doesNotMatch(source, /tabIndex=\{0\}/);
});
