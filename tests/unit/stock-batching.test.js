const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..", "..");
const source = fs.readFileSync(path.join(root, "src", "api", "stock.js"), "utf8");

const helperStart = source.indexOf("export const MAX_STOCK_BATCH_FLOWS");
const helperEnd = source.indexOf("export function useGetStockFlow");
const helperSource = source
  .slice(helperStart, helperEnd)
  .replaceAll("export const ", "const ");

const context = {
  module: { exports: {} },
  PATHS: { STOCK_FLOWS: "stock-flows" },
  ADD: "add",
};

vm.runInNewContext(
  `${helperSource}
module.exports = {
  MAX_STOCK_BATCH_FLOWS,
  MAX_STOCK_TRANSACTION_OPERATIONS,
  buildSupplierStockBatches,
  postSupplierStockBatches,
};`,
  context
);

const {
  MAX_STOCK_BATCH_FLOWS,
  MAX_STOCK_TRANSACTION_OPERATIONS,
  buildSupplierStockBatches,
  postSupplierStockBatches,
} = context.module.exports;

const createFlows = (count, productIdForIndex = (index) => `P${index}`) =>
  Array.from({ length: count }, (_, index) => ({
    id: `flow-${index}`,
    productId: productIdForIndex(index),
  }));

const getOperationCount = (flows) =>
  flows.length + new Set(flows.map((flow) => flow.productId)).size;

const flatten = (batches) => batches.flat();
const getBatchLengths = (batches) => Array.from(batches, (batch) => batch.length);

test("supplier stock batches never exceed the transaction operation budget", () => {
  const flows = [
    ...createFlows(600),
    ...createFlows(300, (index) => `REPEATED-${index % 3}`),
  ];

  const batches = buildSupplierStockBatches(flows);

  assert.ok(batches.length > 1);
  batches.forEach((batch) => {
    assert.ok(getOperationCount(batch) <= MAX_STOCK_TRANSACTION_OPERATIONS);
  });
});

test("249 distinct products fit in one supplier stock batch", () => {
  const batches = buildSupplierStockBatches(createFlows(249));

  assert.deepEqual(getBatchLengths(batches), [249]);
  assert.equal(getOperationCount(batches[0]), 498);
});

test("250 distinct products fit in one supplier stock batch", () => {
  const batches = buildSupplierStockBatches(createFlows(250));

  assert.equal(MAX_STOCK_BATCH_FLOWS, 250);
  assert.equal(MAX_STOCK_TRANSACTION_OPERATIONS, 500);
  assert.deepEqual(getBatchLengths(batches), [250]);
  assert.equal(getOperationCount(batches[0]), 500);
});

test("one supplier stock flow makes one batch with two operations", () => {
  const batches = buildSupplierStockBatches(createFlows(1));

  assert.deepEqual(getBatchLengths(batches), [1]);
  assert.equal(getOperationCount(batches[0]), 2);
});

test("the 251st distinct product moves to the next supplier stock batch", () => {
  const batches = buildSupplierStockBatches(createFlows(251));

  assert.deepEqual(getBatchLengths(batches), [250, 1]);
});

test("500 distinct products are split into two batches of 250 flows", () => {
  const batches = buildSupplierStockBatches(createFlows(500));

  assert.deepEqual(getBatchLengths(batches), [250, 250]);
});

test("repeated products never produce batches larger than the flow limit", () => {
  const batches = buildSupplierStockBatches(createFlows(600, () => "SAME_PRODUCT"));

  assert.deepEqual(getBatchLengths(batches), [250, 250, 100]);
  batches.forEach((batch) => {
    assert.ok(batch.length <= MAX_STOCK_BATCH_FLOWS);
  });
});

test("non-contiguous repeated products still count as one unique product per batch", () => {
  const flows = [
    { id: "flow-1", productId: "A" },
    { id: "flow-2", productId: "B" },
    { id: "flow-3", productId: "A" },
    { id: "flow-4", productId: "C" },
    { id: "flow-5", productId: "B" },
  ];

  const batches = buildSupplierStockBatches(flows);

  assert.deepEqual(getBatchLengths(batches), [5]);
  assert.equal(getOperationCount(batches[0]), 8);
});

test("supplier stock batching preserves every flow in original order", () => {
  const flows = createFlows(120, (index) => `P${index % 7}`);
  const batches = buildSupplierStockBatches(flows);

  assert.equal(
    JSON.stringify(flatten(batches).map((flow) => flow.id)),
    JSON.stringify(flows.map((flow) => flow.id))
  );
  assert.equal(new Set(flatten(batches).map((flow) => flow.id)).size, flows.length);
});

test("supplier stock batch posting is sequential", async () => {
  const calls = [];
  let activeRequests = 0;
  let maxActiveRequests = 0;

  const post = async (url, body) => {
    activeRequests += 1;
    maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
    calls.push({ url, body });

    await new Promise((resolve) => setTimeout(resolve, 5));

    activeRequests -= 1;
    return { data: { statusOk: true, processed: body.flows.length } };
  };

  const result = await postSupplierStockBatches({
    supplierId: "AA",
    inflow: true,
    flows: createFlows(251),
    post,
  });

  assert.equal(result.statusOk, true);
  assert.equal(maxActiveRequests, 1);
  assert.deepEqual(calls.map((call) => call.body.flows.length), [250, 1]);
  assert.deepEqual(calls.map((call) => call.url), [
    "/stock-flows/AA/add",
    "/stock-flows/AA/add",
  ]);
});

test("supplier stock batch posting stops after an intermediate failure", async () => {
  const calls = [];

  const post = async (url, body) => {
    calls.push({ url, body });

    return {
      data: calls.length === 2
        ? { statusOk: false, error: { message: "Demasiadas operaciones" } }
        : { statusOk: true },
    };
  };

  const result = await postSupplierStockBatches({
    supplierId: "AA",
    inflow: false,
    flows: createFlows(500),
    post,
  });

  assert.equal(result.statusOk, false);
  assert.equal(result.error.message, "Demasiadas operaciones");
  assert.deepEqual(calls.map((call) => call.body.flows.length), [250, 250]);
});

test("empty supplier stock batches do not make requests", async () => {
  let calls = 0;

  const result = await postSupplierStockBatches({
    supplierId: "AA",
    inflow: true,
    flows: [],
    post: async () => {
      calls += 1;
      return { data: { statusOk: true } };
    },
  });

  assert.equal(calls, 0);
  assert.equal(result.statusOk, true);
});
