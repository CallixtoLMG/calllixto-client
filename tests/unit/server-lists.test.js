const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { QueryClient, QueryClientProvider, QueryObserver } = require("@tanstack/react-query");

const root = path.join(__dirname, "..", "..");
const constants = {
  DEFAULT_PAGE_SIZE: 20, PAGE_SIZE_OPTIONS: [10, 20, 50, 100].map((value) => ({ key: value, value, text: String(value) })),
  SORTING: { ASC: "ascending", DESC: "descending" }, ENTITIES: { BRANDS: "brands" },
  SHORTKEYS: {}, ICONS: {}, COLORS: {}, CONTENT_SIZES: {}, SIZES: {}, POPUP_POSITIONS: {},
};
const configuration = { defaultFilters: { id: "", name: "", state: "" }, sortFields: { id: "id", name: "name", state: "state" } };
const plain = (value) => JSON.parse(JSON.stringify(value));
const load = (file, dependencies = {}) => {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const { outputText } = ts.transpileModule(source, {
    fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const loaded = { exports: {} };
  vm.runInNewContext(outputText, {
    module: loaded, exports: loaded.exports, console,
    require: (name) => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name),
  }, { filename: file });
  return loaded.exports;
};
const filters = load("src/hooks/useServerListFilters.js", { "@/common/constants": constants });
const createList = (t, respond = () => ({ data: { statusOk: true, brands: [], count: "1200" } })) => {
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false } } });
  const calls = [];
  const api = { get: async (url, options) => { calls.push({ url, ...options }); return respond(options.params); } };
  const paged = load("src/api/pagedLists.js", { "./axios": { getInstance: () => api } });
  const initial = { ...filters.getServerListState(configuration), entity: "brands", url: "brands", hydrated: true };
  const options = (state) => paged.serverListQueryOptions(client, state);
  t.after(() => client.clear());
  return { client, calls, api, paged, initial, options };
};
const settled = (observer) => new Promise((resolve, reject) => {
  let unsubscribe = () => {};
  const check = (result) => {
    if (result.isFetching || result.isPending) return;
    unsubscribe();
    if (result.isError) reject(result.error);
    else resolve(result.data);
  };
  unsubscribe = observer.subscribe(check);
  check(observer.getCurrentResult());
});

test("preferences normalize page size and sorting before the query is enabled", async (t) => {
  for (const stored of [undefined, { page: 2, pageSize: 100, sorting: { key: "name", direction: "descending" } }]) {
    const list = createList(t);
    const observer = new QueryObserver(list.client, list.options({ ...list.initial, hydrated: false }));
    const unsubscribe = observer.subscribe(() => {});
    t.after(unsubscribe);
    assert.equal(list.calls.length, 0);
    const restored = filters.getServerListState(configuration, stored);
    observer.setOptions(list.options({ ...list.initial, ...restored }));
    await settled(observer);
    assert.equal(list.calls.length, 1);
    assert.equal(list.calls[0].params.pageSize, stored ? 100 : 20);
    assert.equal(list.calls[0].params.pageNumber, stored ? 2 : 1);
    assert.equal(list.calls[0].params.sort, stored ? "name" : "id");
    assert.equal(list.calls[0].params.order, stored ? "desc" : "asc");
  }
  const invalid = filters.getServerListState(configuration, { page: -2, pageSize: 999, sorting: { key: "toString" } });
  assert.equal(invalid.pageNumber, 1);
  assert.equal(invalid.pageSize, 20);
  assert.equal(invalid.sort, "id");
});

test("draft stays outside requests; applying, repeating Search, paging, sorting and reset keep request semantics", async (t) => {
  const list = createList(t);
  let state = list.initial;
  const observer = new QueryObserver(list.client, list.options(state));
  t.after(observer.subscribe(() => {}));
  await settled(observer);
  assert.equal(list.calls.length, 1);
  assert.equal(list.calls[0].params.count, true);
  const draft = { ...state.appliedFilters, name: "Draft", state: "ACTIVE" };
  draft.name = "";
  observer.setOptions(list.options(state));
  assert.equal(list.calls.length, 1);

  const submit = async (values) => {
    state = filters.applyServerListFilters(state, values, configuration.defaultFilters);
    const refreshing = list.paged.refreshServerList(list.client, "brands", state);
    observer.setOptions(list.options(state));
    await refreshing;
    await settled(observer);
  };
  draft.name = "  Applied  ";
  await submit(draft);
  assert.equal(list.calls.length, 2);
  assert.equal(list.calls[1].params.name, "Applied");
  assert.equal(list.calls[1].params.count, true);
  await submit(draft); 
  assert.equal(list.calls.length, 3);
  draft.name = "Pending";
  state = { ...state, pageNumber: 2 };
  observer.setOptions(list.options(state));
  await settled(observer);
  assert.equal(list.calls.length, 4);
  assert.equal(list.calls[3].params.pageNumber, 2);
  assert.equal(list.calls[3].params.name, "Applied");
  assert.equal(list.calls[3].params.count, false);
  await submit(state.appliedFilters); 
  assert.equal(list.calls.length, 5);
  assert.equal(list.calls[4].params.pageNumber, 1);
  assert.equal(list.calls[4].params.count, true);
  state = { ...state, pageNumber: 1, pageSize: 50, sort: configuration.sortFields.name, order: "desc" };
  observer.setOptions(list.options(state));
  await settled(observer);
  assert.equal(list.calls.length, 6);
  assert.equal(list.calls[5].params.sort, "name");
  assert.equal(list.calls[5].params.pageSize, 50);
  assert.equal(list.calls[5].params.name, "Applied");
  assert.equal(list.calls[5].params.count, false);
  await submit(configuration.defaultFilters);
  assert.equal(list.calls.length, 7);
  assert.equal(list.calls[6].params.pageNumber, 1);
  assert.equal(list.calls[6].params.count, true);
  assert.deepEqual(plain(state.appliedFilters), configuration.defaultFilters);
  await list.paged.refreshServerList(list.client, "brands", state);
  assert.equal(list.calls.length, 8);
  assert.equal(list.calls[7].params.count, true);
});

test("count strings become numbers and a late response cannot remove the need to recount", async (t) => {
  let resolveOld;
  const list = createList(t, () => ({ data: { statusOk: true, brands: [], count: "1200" } }));
  const options = { ...list.initial, filters: list.initial.appliedFilters, count: true };
  assert.equal((await list.paged.requestListPage(options)).total, 1200);
  list.api.get = (url, request) => {
    list.calls.push({ url, ...request });
    return new Promise((resolve) => { resolveOld = resolve; });
  };
  const pending = list.paged.fetchServerListPage(list.client, options);
  await list.paged.invalidateServerLists(list.client, "brands");
  resolveOld({ data: { statusOk: true, brands: [], count: "999" } });
  await pending;
  list.api.get = async (url, request) => {
    list.calls.push({ url, ...request });
    return { data: { statusOk: true, brands: [], count: "1200" } };
  };
  await list.paged.fetchServerListPage(list.client, options);
  assert.equal(list.calls.at(-1).params.count, true);
});

test("successful Brand mutations refresh the active page and recount; failed mutations do neither", async (t) => {
  const list = createList(t);
  const observer = new QueryObserver(list.client, list.options(list.initial));
  t.after(observer.subscribe(() => {}));
  await settled(observer);
  let result = { statusOk: true };
  const common = Object.fromEntries(["useCreateItem", "useDeleteItem", "useEditItem", "usePostUpdateItem"].map((name) => [name, () => async () => result]));
  const brands = load("src/api/brands.js", {
    "./pagedLists": list.paged, "./axios": { getInstance: () => list.api }, "./common": common,
    "@/common/constants": constants, "@/common/utils": {}, "@/fetchUrls": { PATHS: { BRANDS: "brands" } },
    "@/components/brands/brands.constants": { LIST_BRANDS_QUERY_KEY: "listBrands" },
  });
  for (const hook of ["useCreateBrand", "useEditBrand", "useDeleteBrand", "useSetBrandState"]) {
    let mutate;
    const Probe = () => { mutate = brands[hook](); return null; };
    renderToStaticMarkup(React.createElement(QueryClientProvider, { client: list.client }, React.createElement(Probe)));
    const before = list.calls.length;
    await mutate({ id: "A", state: "INACTIVE" });
    assert.equal(list.calls.length, before + 1);
    assert.equal(list.calls.at(-1).params.count, true);
  }
  result = { statusOk: false };
  const before = list.calls.length;
  let mutate;
  const Probe = () => { mutate = brands.useDeleteBrand(); return null; };
  renderToStaticMarkup(React.createElement(QueryClientProvider, { client: list.client }, React.createElement(Probe)));
  await mutate("A");
  assert.equal(list.calls.length, before);
});

test("export returns all applied matches with three numeric pages, without changing the visible page", async (t) => {
  const list = createList(t, (params) => ({ data: {
    statusOk: true, count: "1200", brands: Array.from({ length: params.pageNumber === 3 ? 200 : 500 }, (_, id) => ({ id })),
  } }));
  const state = { ...list.initial, pageNumber: 4, appliedFilters: { id: "", name: "Applied", state: "" } };
  const items = await list.paged.fetchAllListPages({ entity: state.entity, url: state.url, filters: state.appliedFilters, sort: state.sort, order: state.order });
  assert.equal(items.length, 1200);
  assert.equal(state.pageNumber, 4);
  assert.deepEqual(list.calls.map(({ params }) => params.pageNumber), [1, 2, 3]);
  assert.deepEqual(list.calls.map(({ params }) => params.count), [true, false, false]);
  assert.ok(list.calls.every(({ params }) => params.name === "Applied" && params.pageSize === 500));
});

test("export rejects failed or incomplete pages instead of returning a partial collection", async (t) => {
  for (const failure of ["response", "rejection", "incomplete"]) {
    const list = createList(t, (params) => {
      if (params.pageNumber === 2 && failure === "rejection") throw new Error("Page failed");
      if (params.pageNumber === 2 && failure === "response") return { data: { statusOk: false } };
      return { data: { statusOk: true, count: 1200, brands: Array.from({ length: params.pageNumber === 3 ? 100 : 500 }, (_, id) => ({ id })) } };
    });
    await assert.rejects(list.paged.fetchAllListPages({ entity: "brands", url: "brands", filters: list.initial.appliedFilters }));
    assert.equal(list.calls.length, failure === "incomplete" ? 3 : 2);
  }
});

test("Table render bypasses local transformations remotely and retains them locally", () => {
  let pagination;
  const Box = ({ children }) => React.createElement("div", null, children);
  const StyledTable = Object.assign(Box, { Body: Box, Row: Box });
  const styles = new Proxy({ Table: StyledTable }, { get: (target, name) => target[name] || Box });
  const Table = load("src/common/components/table/Table.jsx", {
    "@/common/constants": constants, "@/common/utils": {}, "@/components/layout": { Loader: Box },
    "@/hooks": { useKeyboardShortcuts() {} }, "next/navigation": { useRouter: () => ({}) },
    "semantic-ui-react": { Button: Box, Checkbox: Box, Header: Box, Popup: Box },
    "../buttons": { IconedButton: Box, PopupActions: Box }, "../custom": { CenteredFlex: Box, Flex: Box, Icon: Box },
    "./Actions": { __esModule: true, default: Box }, "./styles": styles,
    "./Pagination": { __esModule: true, default: (props) => { pagination = props; return null; } },
  }).default;
  const elements = [{ id: "B" }, { id: "A" }];
  elements.filter = elements.sort = elements.slice = () => { throw new Error("Local processing of remote page"); };
  renderToStaticMarkup(React.createElement(Table, {
    elements, paginate: true, onFilter: () => { throw new Error("Local filter"); },
    serverPagination: { hydrated: false, pageNumber: 2, pageSize: 20, total: 35835, sorting: {}, sortFields: {} },
  }));
  assert.equal(pagination.totalItems, 35835);
  assert.equal(pagination.totalPages, 1792);
  assert.equal(pagination.pageSizeReady, false);
  let filtered = 0;
  let sorted = 0;
  renderToStaticMarkup(React.createElement(Table, {
    elements: Array.from({ length: 80 }, (_, id) => ({ id })), paginate: true,
    onFilter: (item) => { filtered += 1; return item.id % 2 === 0; },
    headers: [{ id: 1, key: "id", sortable: true, sortValue: (item) => { sorted += 1; return item.id; } }],
  }));
  assert.equal(filtered, 80);
  assert.ok(sorted > 0);
  assert.equal(pagination.totalItems, 40);
  assert.equal(pagination.totalPages, 2);
  assert.equal(pagination.pageSizeReady, true);
});

test("page-size selector stays neutral until preferences are ready, then shows the real value", () => {
  let dropdown;
  const { Dropdown } = require("semantic-ui-react");
  const Pagination = load("src/common/components/table/Pagination.jsx", {
    "@/common/constants": constants,
    "../custom": { Dropdown: (props) => { dropdown = props; return React.createElement(Dropdown, props); } },
    "./ElementCounter": { __esModule: true, default: () => null },
    "./styles": { PaginationContainer: ({ children, className }) => React.createElement("div", { className }, children) },
  }).default;
  const render = (pageSize, pageSizeReady) => renderToStaticMarkup(React.createElement(Pagination, {
    activePage: 1, totalItems: 1200, totalPages: 60, pageSize, pageSizeReady,
  }));
  const pending = render(20, false);
  assert.equal(dropdown.value, "");
  assert.equal(dropdown.disabled, true);
  assert.equal(dropdown.height, "40px");
  assert.match(pending, /class="[^"]*default text">…</);
  for (const value of [20, 100]) {
    const ready = render(value, true);
    assert.equal(dropdown.value, value);
    assert.equal(dropdown.disabled, false);
    assert.match(ready, new RegExp('class="[^"]*text">' + value + '<'));
  }
});
