const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const { chunk } = require("lodash");

const source = fs.readFileSync(
  path.join(__dirname, "..", "..", "src", "api", "products.js"),
  "utf8"
);
const batchSource = source
  .slice(
    source.indexOf("const MAX_PRODUCT_BATCH_SIZE"),
    source.indexOf("export const useDeleteBySupplierId")
  )
  .replaceAll("export const ", "const ");

for (const [count, expected] of [
  [500, [500]],
  [501, [500, 1]],
]) {
  test(`${count} product updates are sent in batches of ${expected.join(", ")}`, async () => {
    const calls = [];
    const context = {
      module: { exports: {} },
      chunk,
      PATHS: { PRODUCTS: "products" },
      EDIT_BATCH: "edit-batch",
      invalidateProductData: async () => {},
      useQueryClient: () => ({ invalidateQueries: () => {} }),
      setTimeout: (callback) => callback(),
      getInstance: () => ({
        post: async (url, body) => {
          calls.push({ url, body });
          return { data: { statusOk: true, unprocessed: [] } };
        },
      }),
    };

    vm.runInNewContext(`${batchSource}\nmodule.exports = { useEditBatch };`, context);

    const products = Array.from({ length: count }, (_, index) => ({
      id: `P${index}`,
      price: index + 1,
    }));
    const editBatch = context.module.exports.useEditBatch();
    const result = await editBatch(products);

    assert.equal(result.data.statusOk, true);
    assert.deepEqual(calls.map((call) => call.body.update.length), expected);
    assert.ok(calls.every((call) => call.url === "products/edit-batch"));
    assert.ok(calls.every((call) => Object.keys(call.body).join(",") === "update"));
    assert.deepEqual(calls.flatMap((call) => call.body.update), products);
  });
}

test("product batch cache invalidation waits for remaining writes after a rejection", async () => {
  let completeSecond;
  let posts = 0;
  let invalidations = 0;
  const context = {
    module: { exports: {} }, chunk, PATHS: { PRODUCTS: "products" }, EDIT_BATCH: "edit-batch",
    useQueryClient: () => ({ invalidateQueries() {} }),
    invalidateProductData: async () => { invalidations++; },
    setTimeout: (callback) => callback(),
    getInstance: () => ({ post: () => {
      posts++;
      if (posts === 1) return Promise.reject(new Error("First batch failed"));
      return new Promise((resolve) => { completeSecond = () => resolve({ data: { statusOk: true } }); });
    } }),
  };
  vm.runInNewContext(`${batchSource}\nmodule.exports = { useEditBatch };`, context);
  const result = context.module.exports.useEditBatch()(Array.from({ length: 501 }, (_, id) => ({ id: `VA${id}` })));
  const rejected = assert.rejects(result, /First batch failed/);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(posts, 2);
  assert.equal(invalidations, 0);
  completeSecond();
  await rejected;
  assert.equal(invalidations, 1);
});
