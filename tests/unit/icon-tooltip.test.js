const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("IconTooltip exposes a minimal popup icon API", () => {
  const source = read("src", "common", "components", "tooltips", "IconTooltip.jsx");

  assert.match(source, /export const IconTooltip = \(\{/);
  assert.match(source, /content,/);
  assert.match(source, /icon,/);
  assert.match(source, /color,/);
  assert.match(source, /position = POPUP_POSITIONS\.TOP_CENTER/);
  assert.match(source, /size = SIZES\.MINI/);
  assert.match(source, /iconProps = \{\},/);
  assert.match(source, /triggerProps = \{\},/);
});

test("IconTooltip keeps an accessible focusable trigger", () => {
  const source = read("src", "common", "components", "tooltips", "IconTooltip.jsx");

  assert.match(source, /aria-label=\{resolvedAriaLabel\}/);
  assert.match(source, /role="button"/);
  assert.match(source, /tabIndex=\{0\}/);
  assert.match(source, /\{\.\.\.triggerProps\}[\s\S]*aria-label=\{resolvedAriaLabel\}/);
  assert.match(source, /display: "inline-flex"/);
  assert.match(source, /flexShrink: 0/);
});

test("IconTooltip maps string content to aria label by default", () => {
  const source = read("src", "common", "components", "tooltips", "IconTooltip.jsx");

  assert.match(
    source,
    /const resolvedAriaLabel = ariaLabel \|\| \(typeof content === "string" \? content : undefined\);/
  );
});

test("IconTooltip forwards icon props for existing vertical alignment controls", () => {
  const source = read("src", "common", "components", "tooltips", "IconTooltip.jsx");

  assert.match(source, /\$lineHeight="1"/);
  assert.match(source, /\{\.\.\.iconProps\}/);
});

test("tooltips barrel exports IconTooltip", () => {
  const source = read("src", "common", "components", "tooltips", "index.jsx");

  assert.match(source, /export \* from '\.\/IconTooltip';/);
});
