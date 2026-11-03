const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

const helperSource = read("src", "components", "budgets", "BudgetDeliveries", "utils.js")
  .replaceAll("export const ", "const ");

const context = { module: { exports: {} } };

vm.runInNewContext(
  `${helperSource}
module.exports = {
  TOO_MANY_ITEMS_DELIVERY_MESSAGE,
  getConsumeStockErrorMessage,
  getStockControlDisabledProductIds,
  getConsumeStockWarningMessage,
  hasStockControlDisabledProduct,
  hasConsumeStockResponseError,
  hasConsumeStockResponseWarning,
  hasOnlyStockControlDisabledFailures,
  isStockControlDisabledFailure,
  isTooManyItemsConsumeStockError,
};`,
  context
);

const {
  TOO_MANY_ITEMS_DELIVERY_MESSAGE,
  getConsumeStockErrorMessage,
  getStockControlDisabledProductIds,
  getConsumeStockWarningMessage,
  hasStockControlDisabledProduct,
  hasConsumeStockResponseError,
  hasConsumeStockResponseWarning,
  hasOnlyStockControlDisabledFailures,
  isStockControlDisabledFailure,
  isTooManyItemsConsumeStockError,
} = context.module.exports;

const toLocalArray = (value) => Array.from(value);

test("consume stock response helper accepts only successful backend responses", () => {
  const response = { statusOk: true, message: "Stock Consumed" };

  assert.equal(hasConsumeStockResponseError(response), false);
  assert.equal(hasConsumeStockResponseWarning(response), false);
  assert.equal(getConsumeStockWarningMessage(response), undefined);
});

test("consume stock response helper detects logical error returned with HTTP 200", () => {
  const response = {
    error: {
      status: 500,
      message: "Fallo al consumir stock. error: TooManyItemsError...",
      name: "ConsumeStockFailedToError",
    },
    message: "Error al modificar stock.",
  };

  assert.equal(hasConsumeStockResponseError(response), true);
});

test("consume stock response helper maps TooManyItemsError to delivery batch message", () => {
  const response = {
    error: {
      status: 500,
      message:
        "Fallo al consumir stock. error: TooManyItemsError: Error de la base de datos. Demasiados elementos..",
      name: "ConsumeStockFailedToError",
    },
    message: "Error al modificar stock.",
  };

  assert.equal(isTooManyItemsConsumeStockError(response), true);
  assert.equal(getConsumeStockErrorMessage(response), TOO_MANY_ITEMS_DELIVERY_MESSAGE);
});

test("consume stock response helper keeps generic logical error message fallback", () => {
  const response = {
    error: {
      status: 500,
      message: "Otro error",
    },
    message: "Error al modificar stock.",
  };

  assert.equal(isTooManyItemsConsumeStockError(response), false);
  assert.equal(getConsumeStockErrorMessage(response), "Error al modificar stock.");
});

test("consume stock response helper maps one stock-control failure to a warning", () => {
  const response = {
    statusOk: true,
    message: "Stock Consumed",
    failed: [
      {
        productId: "P1",
        rowId: "R1",
        failedReason: "El control de stock está desactivado en este producto.",
      },
    ],
  };

  assert.equal(isStockControlDisabledFailure(response.failed[0]), true);
  assert.equal(hasOnlyStockControlDisabledFailures(response), true);
  assert.equal(hasConsumeStockResponseError(response), false);
  assert.equal(hasConsumeStockResponseWarning(response), true);
  assert.equal(
    getConsumeStockWarningMessage(response),
    "Entrega registrada. 1 producto no modificó stock porque tiene el control de stock desactivado."
  );
});

test("consume stock response helper maps multiple stock-control failures to a plural warning", () => {
  const response = {
    statusOk: true,
    message: "Stock Consumed",
    failed: [
      {
        productId: "P1",
        rowId: "R1",
        failedReason: "El control de stock está desactivado en este producto.",
      },
      {
        productId: "P2",
        rowId: "R2",
        failedReason: "El control de stock está desactivado en este producto.",
      },
    ],
  };

  assert.equal(hasConsumeStockResponseError(response), false);
  assert.equal(hasConsumeStockResponseWarning(response), true);
  assert.equal(
    getConsumeStockWarningMessage(response),
    "Entrega registrada. 2 productos no modificaron stock porque tienen el control de stock desactivado."
  );
});

test("product stock-control indicator derives disabled products from current product state", () => {
  const currentProducts = [
    { id: "P1", stockControl: true },
    { id: "P2", stockControl: false },
    { id: "P3" },
    { id: "P4", stockControl: false },
  ];

  assert.deepEqual(toLocalArray(getStockControlDisabledProductIds(currentProducts)), ["P2", "P4"]);
});

test("product stock-control indicator marks repeated rows by product id", () => {
  const disabledProductIds = new Set(["P1"]);

  assert.equal(hasStockControlDisabledProduct({ rowId: "R1", id: "P1" }, disabledProductIds), true);
  assert.equal(hasStockControlDisabledProduct({ rowId: "R2", id: "P1" }, disabledProductIds), true);
  assert.equal(hasStockControlDisabledProduct({ rowId: "R3", id: "P2" }, disabledProductIds), false);
  assert.equal(hasStockControlDisabledProduct({ rowId: "R4" }, disabledProductIds), false);
});

test("product stock-control indicator follows current state changes", () => {
  const disabledState = new Set(getStockControlDisabledProductIds([{ id: "P1", stockControl: false }]));
  const enabledState = new Set(getStockControlDisabledProductIds([{ id: "P1", stockControl: true }]));
  const loadingState = new Set(getStockControlDisabledProductIds([{ id: "P1" }]));

  assert.equal(hasStockControlDisabledProduct({ id: "P1" }, disabledState), true);
  assert.equal(hasStockControlDisabledProduct({ id: "P1" }, enabledState), false);
  assert.equal(hasStockControlDisabledProduct({ id: "P1" }, loadingState), false);
});

test("consume stock response helper keeps statusOk false and unknown failed reasons as errors", () => {
  assert.equal(hasConsumeStockResponseError({ statusOk: false, message: "Error" }), true);
  assert.equal(
    hasConsumeStockResponseError({
      statusOk: true,
      failed: [{ rowId: "1", failedReason: "Error desconocido" }],
    }),
    true
  );
});

test("BudgetDeliveries checks consume response before showing success toast", () => {
  const source = read("src", "components", "budgets", "BudgetDeliveries", "index.jsx");

  assert.match(source, /onSuccess:\s*\(response\)\s*=>/);
  assert.match(source, /if\s*\(hasConsumeStockResponseError\(response\)\)\s*\{[\s\S]*toast\.error\(getConsumeStockErrorMessage\(response\)\)/);
  assert.match(source, /const warningMessage = getConsumeStockWarningMessage\(response\);/);
  assert.doesNotMatch(source, /setStockControlWarningRowIds|stockControlWarningRowIds|getStockControlWarningRowIds/);
  assert.match(source, /useListProducts\(\)/);
  assert.match(source, /new Set\(getStockControlDisabledProductIds\(currentProductsData\?\.products \?\? \[\]\)\)/);
  assert.match(source, /stockControlDisabledProductIds,/);
  assert.match(source, /if\s*\(warningMessage\)\s*\{[\s\S]*showWarningToast\(warningMessage\)/);
  assert.match(source, /if\s*\(warningMessage\)\s*\{[\s\S]*\}\s*else\s*\{[\s\S]*toast\.success/);
  assert.match(source, /onSuccess\?\.\(\);[\s\S]*resetModalState\(\);[\s\S]*setShowModal\(false\);/);
});

test("budget deliveries product column shows compact current-state warning tooltip", () => {
  const source = read("src", "components", "budgets", "budgets.constants.js");
  const iconTooltipSource = read("src", "common", "components", "tooltips", "IconTooltip.jsx");

  assert.match(source, /stockControlDisabledProductIds/);
  assert.match(source, /product\.id && stockControlDisabledProductIds\?\.has\?\.\(product\.id\)/);
  assert.match(source, /<IconTooltip/);
  assert.match(source, /content="Sin control de stock"/);
  assert.match(source, /ariaLabel="Sin control de stock"/);
  assert.match(source, /icon=\{ICONS\.EXCLAMATION_CIRCLE\}[\s\S]*color=\{COLORS\.YELLOW\}/);
  assert.match(source, /iconProps=\{\{ \$lowTooltip: true \}\}/);
  assert.match(iconTooltipSource, /aria-label=\{resolvedAriaLabel\}[\s\S]*role="button"[\s\S]*tabIndex=\{0\}/);
});
