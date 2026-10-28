const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const lodash = require("lodash");
const { QueryClient, hashKey } = require("@tanstack/react-query");

const root = path.join(__dirname, "..", "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const plain = value => JSON.parse(JSON.stringify(value));

function load(file, imports = {}, globals = {}) {
  const source = ts.transpileModule(read(file), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const context = {
    exports: {}, console, setTimeout, clearTimeout, AbortController, ...globals,
    require: name => {
      if (name === "lodash") return lodash;
      if (!(name in imports)) throw new Error(`Missing test import: ${name}`);
      return imports[name];
    },
  };
  vm.runInNewContext(source, context, { filename: file });
  return context.exports;
}

const mapping = load("src/api/listFilters.js");
const pagination = load("src/api/listPagination.js", {
  "@/common/constants": { DEFAULT_PAGE_SIZE: 20, SORTING: { ASC: "ascending", DESC: "descending" } },
});
const counts = load("src/api/listCounts.js", {
  "@tanstack/react-query": { hashKey }, "./listPagination": pagination,
});

function tableHarness(props = {}) {
  let stateIndex = 0;
  const updates = [];
  let shortcuts;
  const jsx = (type, props) => ({ type, props });
  const styles = Object.fromEntries([
    "ActionsContainer", "BatchGearDesktop", "Cell", "Container", "HeaderCell", "InnerActionsContainer",
    "LinkCell", "LinkContent", "LinkOverlay", "SelectionActionsBar", "SelectionActionsCount", "TableHeader",
    "TableLoaderArea", "TableOuterWrapper", "TableRow", "TableScrollContainer",
  ].map(name => [name, name]));
  styles.Table = { Body: "TableBody", Row: "EmptyRow" };
  const Table = load("src/common/components/table/Table.jsx", {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: {
      useState: initial => [stateIndex++ === 0 ? true : initial, () => {}],
      useMemo: compute => compute(), useEffect: () => {}, useRef: current => ({ current }),
    },
    "@/common/constants": { DEFAULT_PAGE_SIZE: 20, SORTING: { ASC: "ascending", DESC: "descending" },
      SHORTKEYS: { RIGHT_ARROW: "right", LEFT_ARROW: "left" }, POPUP_POSITIONS: {}, CONTENT_SIZES: {}, COLORS: {}, ICONS: {}, SIZES: {} },
    "@/common/utils": {}, "@/components/layout": { Loader: "Loader" },
    "@/hooks": { useKeyboardShortcuts: handlers => { shortcuts = handlers; } },
    "next/navigation": { useRouter: () => ({ push: () => {} }) },
    "semantic-ui-react": { Button: "Button", Checkbox: "Checkbox", Header: "Header", Popup: "Popup" },
    "../buttons": {}, "../custom": {}, "./Actions": { default: "Actions" },
    "./Pagination": { default: "Pagination" }, "./styles": styles,
  }).default;
  const tree = Table({ headers: [{ id: "name", key: "name", sortable: true, value: item => item.name }],
    paginate: true, setFilters: value => updates.push(plain(value)), ...props });
  const nodes = [];
  function visit(node) {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== "object") return;
    nodes.push(node);
    visit(node.props?.children);
  }
  visit(tree);
  return { updates, shortcuts, pager: nodes.find(node => node.type === "Pagination").props,
    header: nodes.find(node => node.type === "HeaderCell").props,
    rowIds: nodes.filter(node => node.props?.["data-testid"] === "table-row").map(node => node.props["data-row-id"]) };
}

test("remote table renders the entire backend page in backend order without filter, sort or slice", () => {
  const elements = [{ id: "B", name: "z" }, { id: "A", name: "a" }];
  for (const operation of ["filter", "sort", "slice"]) Object.defineProperty(elements, operation, {
    value: () => { throw new Error(`Remote ${operation} is forbidden`); },
  });
  const table = tableHarness({ elements, filters: { page: 2, pageSize: 2, sorting: { key: "name", direction: "ascending" } },
    serverPagination: { pageNumber: 2, pageSize: 2 }, onFilter: () => { throw new Error("Local predicate called"); } });
  assert.deepEqual(table.rowIds, ["B", "A"]);
  assert.equal(table.pager.totalItems, undefined);
  assert.equal(table.pager.totalPages, undefined);
  assert.equal(table.pager.canGoNext, true);
  table.pager.onPageChange(null, { activePage: 3 });
  table.pager.onPageSizeChange(null, { value: 50 });
  table.header.onClick();
  table.shortcuts.right();
  assert.deepEqual(table.updates.map(value => [value.page, value.pageSize]), [[3, 2], [1, 50], [1, 2], [3, 2]]);
  assert.deepEqual(table.updates[2].sorting, { key: "name", direction: "descending" });
});

test("remote pagination respects returned metadata and exact-length temporary fallback", () => {
  const elements = [{ id: "B", name: "z" }, { id: "A", name: "a" }];
  const render = metadata => tableHarness({ elements, serverPagination: { pageNumber: 2, pageSize: 2, ...metadata } }).pager;
  assert.equal(render({ hasNext: false }).canGoNext, false);
  assert.equal(render({ pageSize: 3 }).canGoNext, false);
  assert.equal(render({ total: 5 }).totalPages, 3);
  assert.equal(render({ totalPages: 2 }).canGoNext, false);
  assert.equal(render({ pageNumber: 4, pageSize: 50 }).activePage, 4);
  assert.equal(tableHarness({ elements: [], serverPagination: { pageNumber: 3, pageSize: 20 } }).pager.canGoNext, false);
  assert.deepEqual(plain(pagination.readListPagination({ total: false, totalPages: [], pageNumber: true, pageSize: "  " })), {});
});

test("local table mode keeps filtering, ordering and local slicing for catalog consumers", () => {
  const elements = Array.from({ length: 25 }, (_, index) => ({ id: `${index}`, name: `${25 - index}`.padStart(2, "0") }));
  const table = tableHarness({ elements, filters: { page: 2, sorting: { key: "name", direction: "ascending" } },
    onFilter: item => item.id !== "0" });
  assert.equal(table.pager.totalItems, 24);
  assert.equal(table.pager.totalPages, 2);
  assert.deepEqual(table.rowIds, ["4", "3", "2", "1"]);
});

test("remote full refresh refetches current query without calling legacy restore", async () => {
  for (const remote of [true, false]) {
    const calls = { refetch: 0, restore: 0 };
    let actions;
    const jsx = (type, props) => ({ type, props });
    const useActions = load("src/components/layout/useListPageSideActions.jsx", {
      "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
      react: { useState: initial => [initial, () => {}], useRef: current => ({ current }),
        useMemo: compute => compute(), useCallback: fn => fn, useEffect: fn => { fn(); } },
      "@/common/components/modals": { ModalAction: "ModalAction" },
      "@/common/constants": { BUTTON_TEXTS: {}, COLORS: {}, CONTENT_SIZES: {}, ICONS: {} },
      "@/hooks": { useRestoreEntity: () => async () => { calls.restore++; } },
      "./NavActions": { useNavActionsContext: () => ({ setActions: value => { actions = value; } }) },
    }).default;
    useActions({ remote, entity: "products", queryKey: "listProducts", onRefetch: async () => { calls.refetch++; } });
    const update = actions.find(action => action.id === "update");
    await update.items.find(action => action.id === "quick-update").onClick();
    await update.modal.props.onConfirm();
    assert.deepEqual(calls, remote ? { refetch: 2, restore: 0 } : { refetch: 1, restore: 1 });
  }
});

function pagedHarness(pages = []) {
  const requests = [];
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const refs = [], effects = [], pending = [];
  let refIndex = 0, effectIndex = 0;
  const api = load("src/api/pagedLists.js", {
    "@/common/utils": { getDefaultListParams: () => ({ attributes: "id" }) },
    "@tanstack/react-query": {
      hashKey, useQueryClient: () => client,
      useQuery: options => {
        client.getQueryCache().build(client, options);
        return { ...options, data: client.getQueryData(options.queryKey), refetch: () => {
          const request = client.fetchQuery(options); pending.push(request); return request;
        } };
      },
    },
    react: {
      useMemo: compute => compute(),
      useRef: initial => refs[refIndex++] ??= { current: initial },
      useEffect: (callback, dependencies) => {
        const index = effectIndex++;
        const prior = effects[index];
        if (!prior || dependencies.some((value, i) => !Object.is(value, prior.dependencies[i]))) {
          effects[index] = { callback, dependencies, run: true };
        }
      },
    },
    "./listPagination": pagination,
    "./listCounts": counts,
    "./axios": { getInstance: () => ({ get: async (url, options) => {
      requests.push({ url, ...plain(options) });
      assert.ok(pages.length, "Unexpected backend request");
      return { data: pages.shift() };
    } }) },
  });
  return { ...api, requests, client, usePagedList: options => {
    refIndex = 0; effectIndex = 0;
    const result = api.usePagedList(options);
    for (const effect of effects) if (effect.run) { effect.run = false; effect.callback(); }
    return result;
  }, flushEffects: async () => { await Promise.all(pending.splice(0)); } };
}

test("all nine screens map only visible filters; empty/all/table metadata stay out", () => {
  const cases = {
    budgets: { id: "MI525", customer: "Martín Bueno", createdBy: "Leandro Gómez", state: "CONFIRMED", paymentStatus: "PAID" },
    products: { id: "P1", name: "coca", state: "ACTIVE" },
    customers: { name: "Martín", state: "ACTIVE" },
    suppliers: { id: "01", name: "Proveedor", state: "ACTIVE" },
    users: { username: "Martinb@hotmail.com", firstName: "Martín", lastName: "Bueno", state: "ACTIVE" },
    expenses: { id: "A0004", name: "Netflix", categories: "Servicios", state: "PAID" },
    cashBalances: { id: "A0009", paymentMethods: "Efectivo", state: "OPEN" },
    brands: { id: "CG", name: "CallixtoGLM", state: "ACTIVE" },
  };
  for (const [entity, filters] of Object.entries(cases)) {
    const expected = entity === "budgets" ? { ...filters, customerName: filters.customer } : { ...filters };
    if (entity === "budgets") delete expected.customer;
    assert.deepEqual(plain(mapping.toListFilterParams(entity, { ...filters, page: 7, pageSize: 20, sorting: { key: "id" }, unknown: "no" })), expected);
    for (const empty of [undefined, null, "", [], "all"]) {
      const emptyFilters = Object.fromEntries(Object.keys(filters).map(key => [key, empty]));
      assert.deepEqual(plain(mapping.toListFilterParams(entity, emptyFilters)), {});
    }
  }
  assert.deepEqual(plain(mapping.toListFilterParams("budgets", { state: "DRAFT", paymentStatus: "PAID" })), { state: "DRAFT" });
  assert.deepEqual(plain(mapping.toListFilterParams("unknown", { name: "no" })), {});
});

test("new backend contracts are explicitly unconfirmed and easy to rename centrally", () => {
  for (const fields of Object.values(mapping.LIST_FILTER_MAPPING)) {
    for (const config of Object.values(fields)) assert.equal(config.confirmed, false);
  }
  const isolated = load("src/api/listFilters.js");
  isolated.LIST_FILTER_MAPPING.budgets.customer.queryParam = "customerLabel";
  assert.deepEqual(plain(isolated.toListFilterParams("budgets", { customer: "Martín" })), { customerLabel: "Martín" });
});

function commonHarness(pages, client) {
  const requests = [];
  const storageCalls = [];
  const db = Object.fromEntries([
    "getStorageItem", "getAllStorageItems", "clearStorageTable", "bulkPutStorageItems",
    "removeStorageItem", "updateOrCreateStorageItem",
  ].map(name => [name, async args => {
    storageCalls.push({ name, args });
    if (name === "getStorageItem") return { lastUpdatedAt: args.id === "hardReset" ? "2025-12-17" : "2026-10-08" };
    if (name === "getAllStorageItems") return [{ id: "cached", state: "ACTIVE", updatedAt: "2026-10-08" }];
  }]));
  const catalog = load("src/api/catalogLists.js", {
    "./listPagination": pagination,
    "./axios": { getInstance: () => ({ get: async (url, options) => {
      requests.push({ url, ...plain(options) });
      assert.ok(pages.length, "Unexpected extra catalog request");
      return { data: pages.shift() };
    } }) },
  });
  const exports = load("src/api/common.js", {
    "@/common/constants": { HARD_DELETED: "HARD_DELETED", LAST_UPDATED_AT: "lastUpdatedAt", DATE_FORMATS: { ISO: "iso" } },
    "@/common/utils": {},
    "@/common/utils/dates": { getDayDifference: () => 0, now: () => "2026-10-08", getDateWithOffset: () => "sync-start" },
    "@/db": db,
    "@tanstack/react-query": { useQueryClient: () => client },
    "./listCounts": counts,
    "./catalogLists": catalog,
    "./axios": { getInstance: () => ({
      post: async () => ({ data: { statusOk: true, product: { id: "new" } } }),
      put: async () => ({ data: { statusOk: true, product: { id: "edited" } } }),
      delete: async () => ({ data: { statusOk: true } }),
      get: async (url, options) => {
      requests.push({ url, ...plain(options) });
      assert.ok(pages.length, "Unexpected extra backend request");
      return { data: pages.shift() };
    } }) },
  });
  return { ...exports, requests, storageCalls };
}

test("remote page returns exact response, never imports Dexie or loads other pages", async () => {
  const response = { statusOk: true, products: [{ id: "remote" }, { id: "gone", state: "HARD_DELETED" }], total: 77 };
  const h = pagedHarness([response]);
  const result = await h.listPage({ entity: "products", url: "products", params: { pageNumber: 2, pageSize: 20, name: "coca" } });
  assert.equal(result, response);
  assert.equal(h.requests.length, 1);
  assert.deepEqual(h.requests[0].params, { pageNumber: 2, pageSize: 20, name: "coca", count: true });
});

test("count policy: initial, paging, size, sorting, filters and clearing; UI keeps total", async () => {
  const pages = [
    { statusOk: true, products: [{ id: "first" }], count: 347 },
    { statusOk: true, products: [{ id: "second" }] },
    { statusOk: true, products: [], totalPages: 18 },
    { statusOk: true, products: [] },
    { statusOk: true, products: [], total: 12 },
    { statusOk: true, products: [], count: 347 },
  ];
  const h = pagedHarness(pages);
  const base = { entity: "products", url: "products", queryKey: "listProducts", pageNumber: 1, pageSize: 20 };
  const fetch = async variation => {
    const options = { ...base, ...variation };
    const query = h.usePagedList(options);
    await h.client.fetchQuery(query);
    return h.usePagedList(options);
  };
  let query = await fetch({});
  assert.equal(query.data.total, 347);
  assert.equal(query.data.totalPages, 18);
  query = await fetch({ pageNumber: 2 });
  assert.equal(query.data.total, 347);
  assert.equal(query.data.products[0].id, "second");
  assert.equal(pagination.readListPagination(query.data).total, 347);
  query = await fetch({ pageSize: 50 });
  assert.equal(query.data.totalPages, 7, "Recompute using retained total, ignore stale pages");
  query = await fetch({ sorting: { key: "id", direction: "ascending" } });
  assert.equal(query.data.total, 347);
  query = await fetch({ remoteFilters: { name: "coca" } });
  assert.equal(query.data.total, 12);
  query = await fetch({ remoteFilters: {} });
  assert.equal(query.data.total, 347);
  assert.deepEqual(h.requests.map(r => r.params.count), [true, false, false, false, true, true]);
  assert.deepEqual(h.requests.map(r => r.params.pageNumber), [1, 2, 1, 1, 1, 1]);
  assert.ok(h.client.getQueryCache().getAll().every(q => !Object.hasOwn(q.queryKey[2], "count")));
  assert.equal(h.client.getQueryCache().getAll().length, 5, "Revisiting same page creates no separate count cache");
  assert.match(require("axios").getUri({ url: "products", params: { count: false } }), /count=false/);
});

test("missing/invalid count preserves known total; absent total never gets invented", async () => {
  const h = pagedHarness([
    { statusOk: true, products: [] }, { statusOk: true, products: [] },
    { statusOk: true, products: [], count: "0" }, { statusOk: true, products: [], count: false },
  ]);
  const base = { entity: "products", url: "products", queryKey: "products", pageSize: 20 };
  for (const pageNumber of [1, 2, 3, 4]) {
    const query = h.usePagedList({ ...base, pageNumber });
    await h.client.fetchQuery(query);
    const visible = h.usePagedList({ ...base, pageNumber });
    assert.equal(visible.data.total, pageNumber < 3 ? undefined : 0);
  }
  assert.deepEqual(h.requests.map(r => r.params.count), [true, true, true, false]);
  for (const invalid of [false, true, [], {}, null, "", -1, 1.2]) {
    assert.equal(pagination.readListTotal({ count: invalid }), undefined);
  }
});

test("existing React Query invalidation drops entity counts before next page request", async () => {
  const h = pagedHarness([{ statusOk: true, products: [], count: 347, totalPages: 18 }, { statusOk: true, products: [], count: 348 }]);
  const base = { entity: "products", url: "products", queryKey: "listProducts" };
  let query = h.usePagedList(base);
  await h.client.fetchQuery(query);
  await h.client.invalidateQueries({ queryKey: ["listProducts"], refetchType: "none" });
  assert.equal(h.usePagedList(base).data.totalPages, undefined, "Invalidated count also drops its stale page count");
  query = h.usePagedList({ ...base, pageNumber: 2 });
  await h.client.fetchQuery(query);
  assert.equal(h.usePagedList({ ...base, pageNumber: 2 }).data.total, 348);
  assert.deepEqual(h.requests.map(r => r.params.count), [true, true]);
});

test("create/edit/delete invalidate counts even with no matching list prefix", async () => {
  const h = pagedHarness(Array.from({ length: 4 }, () => ({ statusOk: true, products: [], count: 347 })));
  const base = { entity: "products", url: "products", queryKey: "historyLikeDifferentPrefix" };
  const api = commonHarness([], h.client);
  const operations = [api.useCreateItem(), api.useEditItem(), api.useDeleteItem()];
  for (let index = 0; index < 4; index++) {
    await h.client.fetchQuery(h.usePagedList(base));
    if (operations[index]) await operations[index]({ entity: "products", url: "products/new", id: "new", responseEntity: "product", skipStorageUpdate: true });
  }
  assert.deepEqual(h.requests.map(r => r.params.count), [true, true, true, true]);
});

test("in-flight response before invalidation cannot resurrect stale count", async () => {
  const client = new QueryClient();
  const entity = "products";
  const datasetKey = counts.getListDatasetKey({ entity, url: "products", params: { pageNumber: 1, pageSize: 20 } });
  let resolve;
  const pending = counts.fetchCountedListPage({ queryClient: client, entity, datasetKey, params: {},
    fetchPage: () => new Promise(done => { resolve = done; }) });
  counts.invalidateListCounts(client, entity);
  resolve({ products: [], count: 347 });
  await pending;
  assert.equal(counts.getListCountState(client, entity, datasetKey).total, undefined);
});

test("count invalidation is scoped to entity and also cleared on QueryClient reset", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
  const keys = {};
  for (const entity of ["products", "customers"]) {
    keys[entity] = counts.getListDatasetKey({ entity, url: entity, params: { state: "ACTIVE" } });
    await counts.fetchCountedListPage({ queryClient: client, entity, datasetKey: keys[entity], params: {},
      fetchPage: async () => ({ [entity]: [], count: 347 }) });
  }
  counts.invalidateListCounts(client, "products");
  assert.equal(counts.getListCountState(client, "products", keys.products).total, undefined);
  assert.equal(counts.getListCountState(client, "customers", keys.customers).total, 347);
  client.setQueryData(["session"], {});
  client.clear();
  assert.equal(counts.getListCountState(client, "customers", keys.customers).total, undefined);
});

test("product batch creation invalidates the actual page prefix and known count", async () => {
  const h = pagedHarness([{ statusOk: true, products: [], count: 347 }]);
  const base = { entity: "products", url: "products", queryKey: "listProducts" };
  const page = h.usePagedList(base);
  await h.client.fetchQuery(page);
  const api = load("src/api/products.js", {
    "./pagedLists": h, "@/common/constants": { ACTIVE: "ACTIVE", ALL: "none" },
    "@/common/utils": {}, "@/components/products/products.constants": { LIST_PRODUCTS_QUERY_KEY: "listProducts" },
    "@/fetchUrls": { PATHS: { PRODUCTS: "products" }, BATCH: "batch" },
    "@tanstack/react-query": { useQueryClient: () => h.client },
    react: {}, "../db": {}, "./common": {}, "./supplierProducts": {},
    "./axios": { getInstance: () => ({ post: async () => ({ data: { statusOk: true, unprocessed: [] } }) }) },
  }, { setTimeout: callback => { callback(); return 0; } });
  await api.useCreateBatch()([{ id: "new" }]);
  assert.equal(h.client.getQueryState(page.queryKey).isInvalidated, true);
  assert.equal(h.usePagedList(base).data.total, undefined);
});

test("empty remote response stays empty; API errors are not masked as empty results", async () => {
  const h = pagedHarness([{ statusOk: true, products: [] }, { statusOk: false, message: "filter unsupported" }, { statusOk: true }]);
  assert.deepEqual(plain(await h.listPage({ entity: "products", url: "products" })), { statusOk: true, products: [] });
  await assert.rejects(h.listPage({ entity: "products", url: "products" }), /filter unsupported/);
  await assert.rejects(h.listPage({ entity: "products", url: "products" }), /Respuesta sin array products/);
});

test("pagination contract uses pageNumber/pageSize and confirmed sort/order", () => {
  assert.deepEqual(plain(pagination.buildListPageParams()), { pageNumber: 1, pageSize: 20 });
  assert.deepEqual(plain(pagination.buildListPageParams({ pageNumber: 2, pageSize: 50, remoteFilters: { name: "coca" }, sorting: { key: "id", direction: "ascending" } })), { pageNumber: 2, pageSize: 50, name: "coca", sort: "id", order: true });
  assert.equal(pagination.buildListPageParams({ sorting: { key: "id", direction: "descending" } }).order, false);
  assert.deepEqual(plain(pagination.getListPageState({ page: -4, pageSize: 0 })), { pageNumber: 1, pageSize: 20 });
});

test("response adapter consumes only returned metadata, never infers totals from items", () => {
  assert.deepEqual(plain(pagination.readListPagination({ statusOk: true, products: new Array(20) })), {});
  assert.deepEqual(plain(pagination.readListPagination({ total: 0, totalPages: 0, pageNumber: 1, pageSize: 20, hasNext: false })), { total: 0, totalPages: 0, pageNumber: 1, pageSize: 20, hasNext: false });
  assert.deepEqual(plain(pagination.readListPagination({ total: "53", totalPages: "3", pageNumber: "2", pageSize: "20", hasNext: true })), { total: 53, totalPages: 3, pageNumber: 2, pageSize: 20, hasNext: true });
  assert.deepEqual(plain(pagination.readListPagination({ total: null, totalPages: -1, pageNumber: "bad", hasNext: "false" })), {});
});

test("full catalogs retain storage synchronization with finite numeric paging", async () => {
  const h = commonHarness([{ statusOk: true, products: [{ id: "first" }, { id: "second" }], count: "2" }]);
  const result = await h.listItems({ entity: "products", url: "products" });
  assert.equal(result.products[0].id, "cached");
  assert.equal(h.requests.length, 1);
  assert.deepEqual(h.requests[0].params, { sort: "updatedAt", startDate: "sync-start", pageNumber: 1, pageSize: 500, count: true });
  assert.ok(h.storageCalls.some(call => call.name === "getAllStorageItems"));
  assert.ok(h.storageCalls.some(call => call.name === "updateOrCreateStorageItem"));
});

test("all nine list hooks separate cache by filters, page, size, sort and range", async () => {
  for (const entity of ["products", "customers", "suppliers", "users", "expenses", "cashBalances", "brands", "budgets"]) {
    const upper = entity === "cashBalances" ? "CASH_BALANCES" : entity.toUpperCase();
    const constants = { LIST_ATTRIBUTES: ["id"], [`LIST_${upper}_QUERY_KEY`]: `${entity}-list`, LIST_BUDGETS_HISTORY_QUERY_KEY: "history" };
    const h = pagedHarness([{ statusOk: true, [entity]: [] }, { statusOk: true, budgets: [] }]);
    const catalogs = [];
    const api = load(`src/api/${entity}.js`, {
      "./pagedLists": h, "./supplierProducts": {},
      "@/common/constants": { ENTITIES: { [entity.toUpperCase()]: entity }, IN_MS: { ONE_DAY: 86400000 }, DATE_FORMATS: { ISO: "iso" } },
      "@/common/utils": { getDefaultListParams: () => ({ attributes: "id" }) },
      "@/common/utils/dates": { getDateWithOffset: () => "2026-07-08" },
      [`@/components/${entity}/${entity}.constants`]: constants,
      [`../components/${entity}/${entity}.constants`]: constants,
      "@/fetchUrls": { PATHS: { [upper]: entity } },
      "@tanstack/react-query": { useQuery: options => options },
      react: { useMemo: compute => compute() }, "../db": {}, "./axios": {},
      "./common": { listItems: async options => { catalogs.push(options); return options; } },
    });
    const hook = api[`useList${entity[0].toUpperCase()}${entity.slice(1)}`];
    const base = { defaultPageDateRange: 3, remoteFilters: { state: "ACTIVE" }, pageNumber: 1, pageSize: 20 };
    const first = hook(base);
    for (const variation of [{ remoteFilters: { state: "INACTIVE" } }, { pageNumber: 2 }, { pageSize: 50 }, { sorting: { key: "id", direction: "ascending" } }]) {
      assert.notDeepEqual(plain(first.queryKey), plain(hook({ ...base, ...variation }).queryKey));
    }
    assert.equal(hook({ enabled: false }).enabled, false);
    await first.queryFn();
    assert.equal(h.requests[0].params.pageNumber, 1);
    assert.equal(h.requests[0].params.pageSize, 20);
    assert.equal(h.requests[0].params.count, true);
    assert.equal(h.requests[0].params.state, "ACTIVE");
    assert.equal(catalogs.length, 0);
    if (entity === "products") {
      const catalog = api.useProductCatalog();
      assert.notDeepEqual(plain(catalog.queryKey), plain(first.queryKey));
      await catalog.queryFn();
      assert.equal(catalogs.length, 1);
      assert.equal(catalogs[0].params.pageNumber, undefined);
      assert.equal(api.useProductCatalog({ enabled: false }).enabled, false);
      assert.equal(catalog.retry, false);
      assert.equal(catalog.refetchOnWindowFocus, false);
    }
    if (entity === "budgets") {
      const history = api.useListBudgetsHistory({ startDate: "2026-10-01", endDate: "2026-10-08", pageNumber: 2, pageSize: 50 });
      await history.queryFn();
      assert.deepEqual(h.requests[1].params, { sort: "createdAt", startDate: "2026-10-01", endDate: "2026-10-08", pageNumber: 2, pageSize: 50, count: true });
      assert.equal(api.useListBudgetsHistory({ startDate: null, endDate: null }).enabled, false);
    }
  }
});

test("sales date range stays fixed across ordinary renders and paging", () => {
  let memo;
  let dateCalls = 0;
  const api = load("src/api/budgets.js", {
    "./pagedLists": { usePagedList: options => options },
    "@/common/constants": { ENTITIES: { BUDGETS: "budgets" }, DATE_FORMATS: { ISO: "iso" } },
    "@/common/utils/dates": { getDateWithOffset: () => `range-${++dateCalls}` },
    "@/components/budgets/budgets.constants": {}, "@/fetchUrls": { PATHS: { BUDGETS: "budgets" } },
    "@tanstack/react-query": {}, "./axios": {}, "./common": {},
    react: { useMemo: (compute, dependencies) => {
      if (!memo || !lodash.isEqual(memo.dependencies, dependencies)) memo = { dependencies, value: compute() };
      return memo.value;
    } },
  });
  const first = api.useListBudgets({ defaultPageDateRange: 3 });
  assert.equal(api.useListBudgets({ defaultPageDateRange: 3, pageNumber: 2 }).params.startDate, first.params.startDate);
  assert.equal(api.useListBudgets({ defaultPageDateRange: 3, remoteFilters: { customer: "Cliente" } }).params.startDate, first.params.startDate);
  assert.notEqual(api.useListBudgets({ defaultPageDateRange: 6 }).params.startDate, first.params.startDate);
  assert.equal(dateCalls, 2);
});

function formHarness(remoteEntity = "products", options = {}) {
  const defaults = { id: "", name: "", state: "ACTIVE", page: 1, pageSize: 20, ...options };
  let applied = { ...defaults }, values = { ...defaults };
  let dirty = true, controls;
  let stateIndex = 0, refIndex = 0, effectIndex = 0;
  const states = [], refs = [], effects = [], commits = [];
  const methods = {
    control: {},
    reset: next => { if (!lodash.isEqual(values, next)) dirty = true; values = { ...next }; },
    handleSubmit: callback => event => { event?.preventDefault?.(); return callback(values); },
  };
  const api = load("src/hooks/useFilters.js", {
    "@/api/listFilters": mapping, "@/api/listPagination": pagination,
    "@/common/constants": { ALL: "all" },
    react: {
      useState: initial => {
        const index = stateIndex++;
        if (!(index in states)) states[index] = initial;
        return [states[index], next => {
          const value = typeof next === "function" ? next(states[index]) : next;
          if (!Object.is(value, states[index])) { states[index] = value; dirty = true; }
        }];
      },
      useRef: initial => refs[refIndex++] ??= { current: initial },
      useCallback: callback => callback, useMemo: callback => callback(),
      useEffect: (callback, dependencies) => {
        const index = effectIndex++;
        const previous = effects[index];
        if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
          effects[index] = { callback, dependencies, run: true };
        }
      },
    },
    "react-hook-form": { useForm: () => methods, useWatch: () => values },
    "./useFilterParams": { __esModule: true, default: () => ({ hydrated: true, filters: applied, setFilters: next => {
      if (!lodash.isEqual(applied, next)) { applied = next; commits.push(plain(next)); dirty = true; }
    } }) },
  }, { setTimeout: () => { throw new Error("Filter application must not install timers"); } });
  function render() {
    let limit = 10;
    while (dirty && limit--) {
      dirty = false; stateIndex = 0; refIndex = 0; effectIndex = 0;
      controls = api.default({ defaultFilters: defaults, key: "test", remoteEntity });
      for (const effect of effects) if (effect.run) { effect.run = false; effect.callback(); }
    }
    assert.ok(limit > 0, "Hook effects must settle");
  }
  render();
  return {
    get controls() { return controls; }, commits,
    change: (name, value) => { values = { ...values, [name]: value }; dirty = true; render(); },
    submit: () => { controls.onSubmit(); render(); },
    reset: () => { controls.onRestoreFilters(); render(); },
    navigate: metadata => { controls.setFilters({ ...controls.filters, ...metadata }); render(); },
    enter: () => {
      let submitted = 0, prevented = 0;
      const form = { requestSubmit: () => { submitted++; controls.onSubmit(); } };
      api.handleFilterEnter({ key: "Enter", target: { tagName: "INPUT", type: "text", closest: () => form },
        preventDefault: () => { prevented++; }, stopPropagation: () => {} });
      render();
      assert.equal(submitted, 1); assert.equal(prevented, 1);
    },
  };
}

test("typing/clearing changes draft only, with no automatic application or debounce", () => {
  const h = formHarness();
  for (const name of ["c", "co", "coc", "coca", ""]) h.change("name", name);
  assert.equal(h.commits.length, 0);
  assert.equal(h.controls.appliedFilters.name, "");
  assert.equal(h.controls.filterApplication, 0);
});

test("selects stay draft until Buscar", () => {
  const h = formHarness();
  h.change("state", "INACTIVE");
  assert.equal(h.controls.draftFilters.state, "INACTIVE");
  assert.equal(h.controls.appliedFilters.state, "ACTIVE");
  assert.equal(h.commits.length, 0);
});

test("Buscar applies all draft fields together and page 1, preserving live size/sort", () => {
  const h = formHarness();
  h.navigate({ page: 2, pageSize: 50, sorting: { key: "id", direction: "descending" } });
  h.change("name", "coca"); h.change("id", "P1"); h.change("state", "INACTIVE");
  const before = h.commits.length;
  h.submit();
  assert.equal(h.commits.length, before + 1);
  assert.deepEqual(plain(h.controls.listRequest), { remoteFilters: { id: "P1", name: "coca", state: "INACTIVE" },
    pageNumber: 1, pageSize: 50, sorting: { key: "id", direction: "descending" }, filterApplication: 1 });
});

test("Enter uses exactly the Buscar submit handler", () => {
  const click = formHarness(), enter = formHarness();
  for (const h of [click, enter]) { h.change("id", "MI525"); h.change("name", "coca"); }
  click.submit(); enter.enter();
  assert.deepEqual(plain(enter.controls.listRequest), plain(click.controls.listRequest));
  assert.equal(enter.commits.length, 1);
});

test("reset immediately clears draft/applied filters, keeps size/sort and signals application", () => {
  const h = formHarness();
  h.change("id", "P1"); h.change("name", "coca"); h.submit();
  h.navigate({ page: 2, pageSize: 50, sorting: { key: "name", direction: "ascending" } });
  h.change("name", "pending"); h.reset();
  assert.deepEqual(plain(h.controls.queryParams), {});
  assert.equal(h.controls.appliedCount, 0);
  assert.equal(h.controls.draftFilters.name, "");
  assert.equal(h.controls.draftFilters.state, "");
  assert.equal(h.controls.listRequest.pageNumber, 1);
  assert.equal(h.controls.listRequest.pageSize, 50);
  assert.equal(h.controls.filterApplication, 2);
});

test("paging/size/sort use applied filters and retain pending draft", () => {
  const h = formHarness();
  h.change("name", "coca"); h.submit(); h.navigate({ page: 2 });
  h.change("name", "pending");
  assert.equal(h.controls.listRequest.remoteFilters.name, "coca");
  assert.equal(h.controls.listRequest.pageNumber, 2);
  h.navigate({ page: 1, pageSize: 50, sorting: { key: "id", direction: "ascending" } });
  assert.equal(h.controls.draftFilters.name, "pending");
  assert.equal(h.controls.listRequest.remoteFilters.name, "coca");
  assert.equal(h.controls.filterApplication, 1);
  h.submit();
  assert.equal(h.controls.listRequest.remoteFilters.name, "pending");
  assert.equal(h.controls.listRequest.pageNumber, 1);
});

test("explicit application sends one count=true GET, including unchanged Buscar/reset", async () => {
  const form = formHarness();
  const h = pagedHarness(Array.from({ length: 8 }, () => ({ statusOk: true, products: [{ id: "row" }], count: 347 })));
  let previousKey;
  const sync = async () => {
    const options = { entity: "products", url: "products", queryKey: "listProducts", ...form.controls.listRequest };
    const query = h.usePagedList(options);
    const key = hashKey(query.queryKey);
    if (key !== previousKey) { previousKey = key; await h.client.fetchQuery(query); }
    await h.flushEffects();
    return h.usePagedList(options);
  };
  await sync();
  form.change("name", "c"); await sync(); form.change("name", "coca"); await sync();
  form.change("state", "INACTIVE"); await sync();
  assert.equal(h.requests.length, 1, "No requests while editing drafts");
  form.submit(); await sync();
  assert.equal(h.requests.length, 2);
  assert.deepEqual(h.requests.at(-1).params, { name: "coca", state: "INACTIVE", pageNumber: 1, pageSize: 20, count: true });
  form.navigate({ page: 2 }); await sync();
  assert.equal(h.requests.at(-1).params.count, false);
  form.change("name", "pending"); await sync();
  assert.equal(h.requests.length, 3, "Page 2 draft edit doesn't request");
  form.enter(); await sync();
  assert.equal(h.requests.length, 4);
  assert.equal(h.requests.at(-1).params.count, true);
  assert.equal(h.requests.at(-1).params.pageNumber, 1);
  form.submit(); await sync();
  assert.equal(h.requests.length, 5, "Same applied query explicitly refetches once");
  assert.equal(h.requests.at(-1).params.count, true);
  form.reset(); await sync();
  assert.equal(h.requests.length, 6);
  assert.deepEqual(h.requests.at(-1).params, { pageNumber: 1, pageSize: 20, count: true });
  form.reset(); await sync();
  assert.equal(h.requests.length, 7, "Repeated reset also refreshes once");
  assert.equal(h.requests.at(-1).params.count, true);
  assert.ok(h.client.getQueryCache().getAll().every(q => !Object.hasOwn(q.queryKey[2], "filterApplication")));
});

test("useFilters without remoteEntity retains existing explicit-submit behavior", () => {
  const h = formHarness(null, { page: 4 });
  h.change("name", "local");
  assert.equal(h.commits.length, 0);
  h.submit();
  assert.equal(h.controls.filters.name, "local");
  assert.equal(h.controls.filters.page, 4);
});
