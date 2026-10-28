const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.join(__dirname, "../..");
const plain = value => JSON.parse(JSON.stringify(value));
function load(file, imports, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {}, AbortController, setTimeout, clearTimeout, ...globals,
    require: name => {
      assert.ok(name in imports, `Unexpected import ${name}`);
      return imports[name];
    } };
  vm.runInNewContext(source, context, { filename: file });
  return context.exports;
}
const pagination = load("src/api/listPagination.js", {
  "@/common/constants": { DEFAULT_PAGE_SIZE: 20, SORTING: {} },
});
const rows = (length, offset = 0) => Array.from({ length }, (_, i) => ({ id: `P${offset + i}`, state: "ACTIVE" }));
function harness(responses, globals) {
  const requests = [];
  const writes = [];
  const cache = [{ id: "existing", state: "ACTIVE" }];
  const catalog = load("src/api/catalogLists.js", {
    "./listPagination": pagination,
    "./axios": { getInstance: () => ({ get: async (url, options) => {
      requests.push({ url, ...options });
      assert.ok(requests.length <= 10, "Catalog exceeded test request cap");
      assert.ok(responses.length, "Unexpected extra request");
      const response = responses.shift();
      if (response instanceof Error) throw response;
      return { data: typeof response === "function" ? await response(options) : response };
    } }) },
  }, globals);
  const common = load("src/api/common.js", {
    "./catalogLists": catalog, "./listCounts": {}, "./axios": {}, lodash: {},
    "@/common/constants": { HARD_DELETED: "HARD_DELETED", LAST_UPDATED_AT: "lastUpdatedAt" },
    "@/common/utils": {}, "@/common/utils/dates": {}, "@tanstack/react-query": {},
    "@/db": {
      getStorageItem: async () => undefined,
      clearStorageTable: async () => { writes.push({ clearAfterRequests: requests.length }); cache.length = 0; },
      bulkPutStorageItems: async ({ values }) => { writes.push({ putAfterRequests: requests.length }); cache.push(...values); },
      updateOrCreateStorageItem: async () => writes.push("metadata"),
      getAllStorageItems: async () => cache,
    },
  });
  return { ...catalog, ...common, requests, writes, cache,
    fetch: options => catalog.listCatalogPages({ entity: "products", url: "products", ...options }) };
}

test("1200 string count loads exactly pages 1, 2, 3; storage starts after all pages", async () => {
  const h = harness([{ products: rows(500), count: "1200" }, { products: rows(500, 500) }, { products: rows(200, 1000) }]);
  const result = await h.listItems({ entity: "products", url: "products", params: { attributes: "id,state" } });
  assert.equal(result.products.length, 1200);
  assert.deepEqual(h.requests.map(r => plain(r.params)), [1, 2, 3].map(pageNumber => ({
    attributes: "id,state", pageNumber, pageSize: 500, count: pageNumber === 1,
  })));
  assert.deepEqual(h.writes.slice(0, 2), [{ clearAfterRequests: 3 }, { putAfterRequests: 3 }]);
  assert.ok(h.requests.every(r => r.timeout === 15000 && r.signal instanceof AbortSignal));
});

test("count=500 requires exactly one request; count=0 also stops after page 1", async () => {
  for (const count of [500, 0]) {
    const h = harness([{ products: rows(count), count }]);
    assert.equal((await h.fetch()).length, count);
    assert.equal(h.requests.length, 1);
    assert.equal(h.requests[0].params.count, true);
  }
});

test("total alias and returned page-size clamp use the central adapter", async () => {
  const h = harness([{ products: rows(2), total: "3", pageNumber: "1", pageSize: "2" }, { products: rows(1, 2), pageNumber: 2, pageSize: 2 }]);
  assert.equal((await h.fetch()).length, 3);
  assert.deepEqual(h.requests.map(r => r.params.pageSize), [500, 2]);
  assert.deepEqual(h.requests.map(r => r.params.count), [true, false]);
});

test("missing or invalid count rejects after one request, preserving existing Dexie data", async () => {
  for (const count of [undefined, null, "", "bad", true, -1, 1.5, "9007199254740992"]) {
    const h = harness([{ products: rows(1), count }]);
    await assert.rejects(h.listItems({ entity: "products", url: "products" }), /sin count\/total válido/);
    assert.equal(h.requests.length, 1);
    assert.deepEqual(h.writes, []);
    assert.equal(h.cache[0].id, "existing");
  }
});

test("failed page 2 propagates error immediately; never requests page 3 or replaces cache", async () => {
  for (const failure of [new Error("network failed"), { statusOk: false, message: "backend failed" }]) {
    const h = harness([{ products: rows(500), count: 1200 }, failure, { products: rows(200, 1000) }]);
    await assert.rejects(h.listItems({ entity: "products", url: "products" }), /failed/);
    assert.equal(h.requests.length, 2);
    assert.deepEqual(h.writes, []);
    assert.equal(h.cache[0].id, "existing");
  }
});

test("repeated page, wrong page number, changed size/count or incomplete page abort bounded load", async () => {
  const badPages = [
    { products: rows(500) },
    { products: rows(500, 500), pageNumber: 1 },
    { products: rows(500, 500), pageSize: 250 },
    { products: rows(500, 500), count: 1201 },
    { products: rows(499, 500) },
  ];
  for (const bad of badPages) {
    const h = harness([{ products: rows(500), count: 1200 }, bad]);
    await assert.rejects(h.fetch(), /repetido|no avanzó|cambió|incompleta/);
    assert.equal(h.requests.length, 2);
  }
});

test("missing array/key, bad first page length or excessive page count stop immediately", async () => {
  for (const response of [{ count: 0 }, { products: [{}], count: 1 }, { products: [], count: 1 }, { products: rows(500), count: 500001 }]) {
    const h = harness([response]);
    await assert.rejects(h.fetch(), /sin array|sin id|incompleta|límite/);
    assert.equal(h.requests.length, 1);
  }
});

test("query cancellation and overall deadline abort load and release timer", async () => {
  const controller = new AbortController();
  const h = harness([() => { controller.abort(); return { products: rows(500), count: 1200 }; }]);
  await assert.rejects(h.fetch({ signal: controller.signal }), /cancelada/);
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].signal.aborted, true);
  let triggerDeadline, cleared = false;
  const timed = harness([options => {
    triggerDeadline();
    assert.equal(options.signal.aborted, true);
    return { products: rows(500), count: 1200 };
  }], { setTimeout: callback => { triggerDeadline = callback; return 123; },
    clearTimeout: id => { assert.equal(id, 123); cleared = true; } });
  await assert.rejects(timed.fetch(), /cancelada/);
  assert.equal(timed.requests.length, 1);
  assert.equal(cleared, true);
  controller.abort();
  const preAborted = harness([]);
  await assert.rejects(preAborted.fetch({ signal: controller.signal }), /cancelada/);
  assert.equal(preAborted.requests.length, 0);
});

test("settings catalogs use entity identity; deleted records are excluded only after complete load", async () => {
  const settings = harness([{ settings: [{ entity: "general" }], count: 1 }]);
  assert.equal((await settings.listCatalogPages({ entity: "settings", url: "settings", mainKey: "entity" }))[0].entity, "general");
  const products = harness([{ products: [{ id: "live" }, { id: "gone", state: "HARD_DELETED" }], count: 2 }]);
  assert.deepEqual(plain((await products.listItems({ entity: "products", url: "products" })).products), [{ id: "live" }]);
});

test("supplier products default to disabled; only explicit tool load reads catalog", async () => {
  const queries = [], calls = [];
  const api = load("src/api/products.js", {
    "./pagedLists": {}, "./axios": {}, "../db": {}, lodash: {}, react: { useCallback: fn => fn },
    "./supplierProducts": {
      getSupplierProductsQueryOptions: supplierId => ({ queryKey: ["supplier-tools", supplierId], retry: false, refetchOnWindowFocus: false }),
      loadSupplierProducts: async (client, supplierId) => { calls.push({ client, supplierId }); return [{ id: "01CG001" }]; },
      invalidateSupplierProducts: () => {},
    },
    "./common": { listItems: async options => { calls.push(options); return { products: [{ id: "01CG001" }, { id: "02CG001" }] }; } },
    "@/common/constants": { ENTITIES: { PRODUCTS: "products" }, IN_MS: { ONE_DAY: 86400000 } },
    "@/common/utils": { getDefaultListParams: () => ({ attributes: "id" }) },
    "@/components/products/products.constants": { LIST_PRODUCTS_QUERY_KEY: "listProducts", LIST_PRODUCTS_BY_SUPPLIER_QUERY_KEY: "supplierProducts" },
    "@/fetchUrls": { PATHS: { PRODUCTS: "products" } },
    "@tanstack/react-query": { useQueryClient: () => "client", useQuery: options => { queries.push(options); return options; } },
  });
  const tools = api.useProductsBySupplierId("01");
  assert.equal(tools.enabled, false);
  assert.equal(calls.length, 0);
  assert.equal(api.useProductsBySupplierId("01", { enabled: false }).enabled, false);
  assert.equal(api.useProductsBySupplierId(undefined, { enabled: true }).enabled, false);
  assert.deepEqual(plain(await tools.loadProducts()), [{ id: "01CG001" }]);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { client: "client", supplierId: "01" });
  assert.equal(tools.retry, false);
  assert.equal(tools.refetchOnWindowFocus, false);
  const catalog = api.useProductCatalog();
  assert.equal(catalog.enabled, true);
  assert.deepEqual(plain(catalog.queryKey), ["listProducts", "catalog"]);
  assert.equal(api.useHasProductsByBrandId, undefined, "Eager association hook removed");
});
