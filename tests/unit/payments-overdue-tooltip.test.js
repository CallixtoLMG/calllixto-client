const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

const paymentFiles = [
  {
    label: "payments detail",
    source: () => read("src", "components", "payments", "index.jsx"),
  },
  {
    label: "create budget payment",
    source: () => read("src", "components", "payments", "CreateBudgetPayment", "index.jsx"),
  },
];

for (const { label, source } of paymentFiles) {
  test(`${label} overdue warning delegates simple popup icon infrastructure`, () => {
    const fileSource = source();

    assert.match(fileSource, /import \{ IconTooltip \} from "@\/common\/components\/tooltips";/);
    assert.match(fileSource, /element\.isOverdue && \(/);
    assert.match(fileSource, /<IconTooltip/);
    assert.match(fileSource, /content="Pago posterior a la fecha de vencimiento"/);
    assert.match(fileSource, /icon=\{ICONS\.EXCLAMATION_CIRCLE\}/);
    assert.match(fileSource, /color=\{COLORS\.RED\}/);
    assert.match(fileSource, /position=\{POPUP_POSITIONS\.TOP_CENTER\}/);
    assert.match(fileSource, /size=\{SIZES\.MINI\}/);
    assert.match(fileSource, /ariaLabel="Pago vencido"/);
    assert.match(fileSource, /iconProps=\{\{ size: SIZES\.SMALL, \$pointer: false \}\}/);
  });

  test(`${label} removes direct Popup Icon warning trigger`, () => {
    const fileSource = source();

    assert.doesNotMatch(
      fileSource,
      /trigger=\{<Icon name=\{ICONS\.EXCLAMATION_CIRCLE\} color=\{COLORS\.RED\} size=\{SIZES\.SMALL\} \/>\}/
    );
  });
}
