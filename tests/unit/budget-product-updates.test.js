const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

const helperSource = read("src", "components", "budgets", "productUpdates.utils.js")
  .replaceAll("export const ", "const ");

const context = { module: { exports: {} } };

vm.runInNewContext(
  `${helperSource}
module.exports = {
  getBudgetProductChanges,
};`,
  context
);

const { getBudgetProductChanges } = context.module.exports;

test("missing editablePrice and explicit false are equivalent", () => {
  const changes = getBudgetProductChanges(
    { price: 10, state: "ACTIVE", editablePrice: undefined },
    { price: 10, state: "ACTIVE", editablePrice: false }
  );

  assert.equal(changes.editablePrice.changed, false);
  assert.equal(changes.hasChanges, false);
});

test("editablePrice false to true is a visible change", () => {
  const changes = getBudgetProductChanges(
    { price: 10, state: "ACTIVE", editablePrice: false },
    { price: 10, state: "ACTIVE", editablePrice: true }
  );

  assert.equal(changes.editablePrice.changed, true);
  assert.equal(changes.editablePrice.oldValue, false);
  assert.equal(changes.editablePrice.newValue, true);
  assert.equal(changes.hasChanges, true);
});

test("missing fractionConfig and inactive fractionConfig are equivalent", () => {
  const changes = getBudgetProductChanges(
    { price: 10, state: "ACTIVE", fractionConfig: undefined },
    { price: 10, state: "ACTIVE", fractionConfig: { active: false, value: 1, unit: "mt" } }
  );

  assert.equal(changes.fractionConfigActive.changed, false);
  assert.equal(changes.hasChanges, false);
});

test("inactive fractionConfig to active fractionConfig is a visible change", () => {
  const changes = getBudgetProductChanges(
    { price: 10, state: "ACTIVE", fractionConfig: { active: false } },
    { price: 10, state: "ACTIVE", fractionConfig: { active: true, value: 1, unit: "mt" } }
  );

  assert.equal(changes.fractionConfigActive.changed, true);
  assert.equal(changes.fractionConfigActive.oldValue, false);
  assert.equal(changes.fractionConfigActive.newValue, true);
  assert.equal(changes.hasChanges, true);
});

test("price difference is a visible change", () => {
  const changes = getBudgetProductChanges(
    { price: 1500, state: "ACTIVE" },
    { price: 1800, state: "ACTIVE" }
  );

  assert.equal(changes.price.changed, true);
  assert.equal(changes.price.oldValue, 1500);
  assert.equal(changes.price.newValue, 1800);
  assert.equal(changes.hasChanges, true);
});

test("state difference is a visible change", () => {
  const changes = getBudgetProductChanges(
    { price: 10, state: "ACTIVE" },
    { price: 10, state: "OOS" }
  );

  assert.equal(changes.state.changed, true);
  assert.equal(changes.state.oldValue, "ACTIVE");
  assert.equal(changes.state.newValue, "OOS");
  assert.equal(changes.hasChanges, true);
});

test("equivalent product after boolean normalization is not changed", () => {
  const changes = getBudgetProductChanges(
    { price: 10, state: "ACTIVE", editablePrice: null, fractionConfig: undefined },
    { price: 10, state: "ACTIVE", editablePrice: false, fractionConfig: { active: false } }
  );

  assert.equal(changes.hasChanges, false);
});

test("stockControl difference does not affect changed status", () => {
  const changes = getBudgetProductChanges(
    { price: 10, state: "ACTIVE", stockControl: true },
    { price: 10, state: "ACTIVE", stockControl: false }
  );

  assert.equal(changes.hasChanges, false);
});

test("tags difference does not affect changed status", () => {
  const changes = getBudgetProductChanges(
    { price: 10, state: "ACTIVE", tags: ["old"] },
    { price: 10, state: "ACTIVE", tags: ["new"] }
  );

  assert.equal(changes.hasChanges, false);
});
