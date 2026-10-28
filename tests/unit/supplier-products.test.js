const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const { QueryClient, QueryObserver } = require("@tanstack/react-query");

function load(file, imports) {
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../..", file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {}, AbortController, setTimeout, clearTimeout,
    require: name => { assert.ok(name in imports, `Unexpected import ${name}`); return imports[name]; } };
  vm.runInNewContext(source, context, { filename: file });
  return context.exports;
}
const plain = value => JSON.parse(JSON.stringify(value));
function harness({ count = 1200, failPage } = {}) {
  const requests = [];
  let failure = failPage;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const pagination = load("src/api/listPagination.js", { "@/common/constants": { SORTING: {} } });
  const catalog = load("src/api/catalogLists.js", {
    "./listPagination": pagination,
    "./axios": { getInstance: () => ({ get: async (url, options) => {
      const params = plain(options.params);
      requests.push({ url, ...params });
      assert.ok(requests.length <= 10, "Bounded mock: too many product requests");
      assert.ok(params.supplierId, "Every request must be filtered on backend");
      if (params.pageNumber === failure) throw new Error("page failed");
      const total = typeof count === "object" ? count[params.supplierId] : count;
      const start = (params.pageNumber - 1) * params.pageSize;
      const products = Array.from({ length: Math.max(0, Math.min(params.pageSize, total - start)) }, (_, index) => ({
        id: `${params.supplierId}CG${start + index}`, supplierId: params.supplierId,
      }));
      return { data: { statusOk: true, products, ...(params.count && { count: String(total) }) } };
    } }) },
  });
  const api = load("src/api/supplierProducts.js", {
    "./catalogLists": catalog, "@/common/constants": { ENTITIES: { PRODUCTS: "products" } },
    "@/components/products/products.constants": { LIST_PRODUCTS_QUERY_KEY: "listProducts" },
    "@/fetchUrls": { PATHS: { PRODUCTS: "products" } },
  });
  return { ...api, client, requests, load: id => api.loadSupplierProducts(client, id),
    recover: () => { failure = undefined; } };
}

test("supplier tool: 1200 string count yields exactly three filtered requests and 1200 products", async () => {
  const h = harness();
  const products = await h.load("VA");
  assert.equal(products.length, 1200);
  assert.ok(products.every(product => product.supplierId === "VA"));
  assert.deepEqual(h.requests, [1, 2, 3].map(pageNumber => ({
    url: "products", supplierId: "VA", pageNumber, pageSize: 500, count: pageNumber === 1,
  })));
});

test("supplier tool: 500 products needs one request; empty supplier also stops after one", async () => {
  for (const count of [500, 0]) {
    const h = harness({ count });
    assert.equal((await h.load("VA")).length, count);
    assert.equal(h.requests.length, 1);
  }
});

test("fresh cache reused by multiple tools; concurrent loads share in-flight query", async () => {
  const h = harness();
  const [first, second] = await Promise.all([h.load("VA"), h.load("VA")]);
  assert.equal(first, second);
  assert.equal(await h.load("VA"), first);
  assert.equal(h.requests.length, 3);
  assert.equal(h.SUPPLIER_PRODUCTS_STALE_TIME, 300000);
});

test("cache isolates suppliers, without global collection or local prefix filtering", async () => {
  const h = harness({ count: { VA: 1200, RB: 500 } });
  const first = await h.load("VA"), second = await h.load("RB");
  assert.equal(second.length, 500);
  assert.ok(second.every(product => product.supplierId === "RB"));
  assert.equal(await h.load("VA"), first);
  assert.deepEqual(h.requests.map(r => r.supplierId), ["VA", "VA", "VA", "RB"]);
});

test("page 2 failure stops immediately, never publishes partial data; next attempt starts at page 1", async () => {
  const h = harness({ failPage: 2 });
  let toolRuns = 0;
  await assert.rejects(h.load("VA").then(() => toolRuns++), /page failed/);
  assert.equal(toolRuns, 0);
  assert.deepEqual(h.requests.map(r => r.pageNumber), [1, 2]);
  assert.equal(h.client.getQueryData(h.getSupplierProductsQueryKey("VA")), undefined);
  h.recover();
  const products = await h.load("VA");
  assert.equal(products.length, 1200);
  assert.deepEqual(h.requests.map(r => r.pageNumber), [1, 2, 1, 2, 3]);
});

test("targeted stock invalidation loads only on next tool; other supplier stays fresh", async () => {
  const h = harness({ count: 500 });
  await h.load("VA"); const other = await h.load("RB");
  const observer = new QueryObserver(h.client, { ...h.getSupplierProductsQueryOptions("VA"), enabled: false });
  const unsubscribe = observer.subscribe(() => {});
  await h.invalidateSupplierProducts(h.client, "VA");
  assert.equal(h.requests.length, 2, "Invalidation must not load products automatically");
  assert.equal(await h.load("RB"), other);
  await h.load("VA");
  assert.deepEqual(h.requests.map(r => r.supplierId), ["VA", "RB", "VA"]);
  unsubscribe();
});

test("existing product mutation prefix invalidates supplier cache without mounting/refetching catalog", async () => {
  const h = harness({ count: 500 });
  const observer = new QueryObserver(h.client, { ...h.getSupplierProductsQueryOptions("VA"), enabled: false });
  const unsubscribe = observer.subscribe(() => {});
  assert.equal(h.requests.length, 0, "Opening detail remains lazy");
  await h.load("VA");
  await h.client.invalidateQueries({ queryKey: ["listProducts"] });
  assert.equal(h.requests.length, 1);
  assert.equal(h.client.getQueryState(h.getSupplierProductsQueryKey("VA")).isInvalidated, true);
  await h.load("VA");
  assert.equal(h.requests.length, 2);
  unsubscribe();
});

test("missing supplier ID fails locally without unfiltered request", async () => {
  const h = harness();
  await assert.rejects(h.load(undefined), /Proveedor inválido/);
  assert.equal(h.requests.length, 0);
});
