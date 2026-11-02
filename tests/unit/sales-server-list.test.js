const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { QueryClient, QueryClientProvider, QueryObserver } = require("@tanstack/react-query");

const root = path.join(__dirname, "../..");
const Box = ({ children }) => React.createElement("div", null, children);
const constants = {
  ENTITIES: { BUDGETS: "budgets", CUSTOMERS: "customers" }, ALL: "all",
  IN_MS: {}, CONTENT_SIZES: {}, COLORS: {}, DATE_FORMATS: {}, FIELD_LABELS: {}, ICONS: {}, POPUP_POSITIONS: {},
  SELECT_ALL_OPTION: { value: "all" }, SORTING: { ASC: "ascending", DESC: "descending" },
  DEFAULT_PAGE_SIZE: 20, PAGE_SIZE_OPTIONS: [{ value: 20 }, { value: 100 }], SHORTKEYS: {},
  PAGES: { BUDGETS: { DRAFT: (id) => `/draft/${id}`, SHOW: (id) => `/budget/${id}` }, BUDGETS_HISTORY: {} },
};
const load = (file, dependencies) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  });
  const loaded = { exports: {} };
  vm.runInNewContext(outputText, { module: loaded, exports: loaded.exports, console,
    require: (name) => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name),
  }, { filename: file });
  return loaded.exports;
};
const plain = (value) => JSON.parse(JSON.stringify(value));
const budgetConstants = load("src/components/budgets/budgets.constants.js", {
  "@/common/constants": constants,
  "@/common/components/custom": { Box, Flex: Box, OverflowWrapper: Box },
  "@/common/utils": {}, "@/common/utils/dates": {}, "@/common/utils/pluralization": {},
  "semantic-ui-react": { Label: Box, Popup: Box }, "../../common/components/form": {},
  "../../common/components/tooltips": {}, "../products/products.constants": {},
  "../products/products.utils": {}, "./budgets.utils": {},
});
const filters = load("src/hooks/useServerListFilters.js", { "@/common/constants": constants });
const settled = (observer) => new Promise((resolve, reject) => {
  let unsubscribe = () => {};
  const check = (result) => {
    if (result.isFetching || result.isPending) return;
    unsubscribe();
    if (result.isError) reject(result.error); else resolve(result.data);
  };
  unsubscribe = observer.subscribe(check);
  check(observer.getCurrentResult());
});
const setup = (t) => {
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false } } });
  t.after(() => client.clear());
  const calls = [];
  let failPage;
  const axios = { getInstance: () => ({ get: async (url, options) => {
    calls.push({ url, ...options });
    if (failPage === options.params.pageNumber) throw new Error("Page failed");
    const length = options.params.pageSize === 500 ? (options.params.pageNumber === 3 ? 200 : 500) : 20;
    return { data: { statusOk: true, [url]: Array.from({ length }, (_, id) => ({ id })), count: "1200", LastEvaluatedKey: {} } };
  } }) };
  const paged = load("src/api/pagedLists.js", { "./axios": axios });
  const common = Object.fromEntries(["useCreateItem", "useEditItem", "usePatchItem", "useDeleteItem", "usePostUpdateItem"]
    .map((name) => [name, () => async (options) => {
      if (options.entity === "customers") assert.equal(options.skipStorageUpdate, true, "Customers must not write retired Dexie table");
      return { statusOk: true };
    }]));
  const api = load("src/api/budgets.js", {
    "@/common/constants": constants, "@/components/budgets/budgets.constants": budgetConstants,
    "@/fetchUrls": { PATHS: constants.ENTITIES }, "./axios": axios, "./common": common,
    "./pagedLists": { ...paged, usePagedList: (state) => state },
  });
  const customers = load("src/api/customers.js", {
    "@/common/constants": constants, "@/components/customers/customers.constants": { CUSTOMER_CATALOG_QUERY_KEY: "customerCatalog" },
    "@/fetchUrls": { PATHS: constants.ENTITIES }, "./axios": axios, "./common": common, "./pagedLists": paged,
  });
  const state = { appliedFilters: { ...budgetConstants.SALES_FILTERS }, hydrated: true, pageNumber: 1, pageSize: 20, sort: "id", order: "asc" };
  const range = { startDate: "2025-11-02T12:00:00", settingsReady: true };
  const request = (value = state) => api.getBudgetListState(value, range);
  const options = (value = state) => paged.serverListQueryOptions(client, api.usePagedBudgets(request(value)));
  const hook = (fn) => {
    let result;
    const Probe = () => { result = fn(); return null; };
    renderToStaticMarkup(React.createElement(QueryClientProvider, { client }, React.createElement(Probe)));
    return result;
  };
  return { client, calls, paged, api, customers, state, range, request, options, hook, fail: (page) => { failPage = page; } };
};

test("Sales paging keeps applied range and sends count=false after the first total", async (t) => {
  const a = setup(t);
  const observer = new QueryObserver(a.client, a.options());
  t.after(observer.subscribe(() => {}));
  await settled(observer);
  assert.deepEqual(plain(a.calls[0].params), { startDate: a.range.startDate, pageNumber: 1, pageSize: 20, sort: "id", order: true, count: true });
  observer.setOptions(a.options({ ...a.state, pageNumber: 2 }));
  await settled(observer);
  assert.equal(a.calls.length, 2);
  assert.equal(a.calls[1].params.pageNumber, 2);
  assert.equal(a.calls[1].params.count, false);
  assert.equal(a.calls[1].params.startDate, a.range.startDate);
});

test("Sales draft stays out of requests; Buscar maps all applied filters and recounts, including repeated Search", async (t) => {
  const a = setup(t);
  const observer = new QueryObserver(a.client, a.options());
  t.after(observer.subscribe(() => {}));
  await settled(observer);
  const draft = { id: "B1", customer: "Ana", createdBy: "Vendedor Uno", state: "CONFIRMED", paymentStatus: "PAID" };
  assert.equal(a.calls.length, 1);
  const next = filters.applyServerListFilters({ ...a.state, pageNumber: 4 }, draft, budgetConstants.SALES_FILTERS);
  await a.paged.refreshServerList(a.client, "budgets", a.request(next));
  observer.setOptions(a.options(next));
  await settled(observer);
  assert.equal(a.calls.length, 2);
  assert.deepEqual(plain(a.calls[1].params), {
    id: "B1", customerName: "Ana", createdBy: "Vendedor Uno", state: "CONFIRMED", paymentStatus: "PAID",
    startDate: a.range.startDate, pageNumber: 1, pageSize: 20, sort: "id", order: true, count: true,
  });
  await a.paged.refreshServerList(a.client, "budgets", a.request(next));
  assert.equal(a.calls.length, 3, "refresh must use the same boolean-order query key");
  assert.equal(a.calls[2].params.count, true);
});

test("Sales payment mapping sends PAID/PENDING only for CONFIRMED", () => {
  for (const paymentStatus of ["PAID", "PENDING"]) {
    const state = { appliedFilters: { state: "CONFIRMED", paymentStatus }, hydrated: true, order: "desc" };
    const api = load("src/api/budgets.js", { "@/common/constants": constants, "@/components/budgets/budgets.constants": {},
      "@/fetchUrls": {}, "./axios": {}, "./common": {}, "./pagedLists": {} });
    const range = { startDate: "range", settingsReady: true };
    assert.equal(api.getBudgetListState(state, range).appliedFilters.paymentStatus, paymentStatus);
    assert.equal(api.getBudgetListState(state, range).order, false);
    assert.equal(api.getBudgetListState({ ...state, appliedFilters: { state: "PENDING", paymentStatus } }, range).appliedFilters.paymentStatus, undefined);
  }
});

test("Sales sort whitelist maps Fecha to createdAt with local boolean order and rejects unsupported stored sorts", async (t) => {
  const a = setup(t);
  const configuration = { defaultFilters: budgetConstants.SALES_FILTERS, sortFields: budgetConstants.BUDGET_SORT_FIELDS };
  assert.deepEqual(plain(configuration.sortFields), { id: "id", date: "createdAt" });
  for (const key of ["customer", "total", "paidAmount", "pendingAmount", "createdBy"]) {
    assert.equal(filters.getServerListState(configuration, { sorting: { key } }).sort, "id");
  }
  for (const [direction, order] of [["ascending", true], ["descending", false]]) {
    const state = filters.getServerListState(configuration, { sorting: { key: "date", direction } });
    await a.client.fetchQuery(a.options({ ...state, hydrated: true }));
    assert.equal(a.calls.at(-1).params.sort, "createdAt");
    assert.equal(a.calls.at(-1).params.order, order);
  }
  assert.equal(a.calls.length, 2);
});

test("Sales waits through placeholder and pending Settings, then requests the configured 12-month range once", async (t) => {
  const a = setup(t);
  let settings = { data: {}, isSuccess: true, isPlaceholderData: true, isFetching: true };
  let captured;
  const offsets = [];
  const Route = load("src/app/(private)/ventas/page.jsx", {
    "@/api/budgets": { ...a.api, usePagedBudgets: (state) => { captured = state; return { total: null }; } },
    "@/api/pagedLists": a.paged, "@/api/settings": { useGetSetting: () => settings },
    "@/common/constants": constants, "@/common/utils/dates": { getDateWithOffset: ({ offset }) => { offsets.push(offset); return `range${offset}`; } },
    "@/common/utils/pluralization": {}, "@/components/budgets/budgets.constants": budgetConstants,
    "@/components/budgets/ServerBudgetsPage": { default: () => null },
    "@/components/layout": { useBreadcrumContext: () => ({ setLabels() {} }) }, "@/hooks": { useKeyboardShortcuts() {} },
    "@/hooks/useServerListFilters": { default: () => ({ ...a.state, refresh() {} }) },
    "next/navigation": { useRouter: () => ({ push() {} }) },
  }).default;
  const render = () => renderToStaticMarkup(React.createElement(QueryClientProvider, { client: a.client }, React.createElement(Route)));
  render();
  const options = () => a.paged.serverListQueryOptions(a.client, a.api.usePagedBudgets(captured));
  const observer = new QueryObserver(a.client, options());
  t.after(observer.subscribe(() => {}));
  assert.equal(a.calls.length, 0);
  assert.deepEqual(offsets, [], "placeholder must not construct fallback 3-month range");
  settings = { data: { defaultPageDateRange: { value: 12 } }, isSuccess: true, isFetching: true };
  render(); observer.setOptions(options());
  assert.equal(a.calls.length, 0);
  settings = { ...settings, isFetching: false };
  render(); observer.setOptions(options());
  await settled(observer);
  assert.equal(a.calls.length, 1);
  assert.equal(a.calls[0].params.startDate, "range-12");
  assert.ok(offsets.every((offset) => offset === -12));
});

test("Sales table bypasses local filtering/export and exposes only ID and Fecha sorts", (t) => {
  const a = setup(t);
  let table, form;
  const controls = [];
  const Page = load("src/components/budgets/ServerBudgetsPage.jsx", {
    "@/common/components/form": { DropdownControlled: (props) => { controls.push(props); return null; }, TextControlled: Box },
    "@/common/components/table": { Filters: Box, Table: (props) => { table = props; return null; } },
    "@/common/constants": constants, "@/components/layout": { useListPageSideActions() {} }, "./budgets.constants": budgetConstants,
    "react-hook-form": { FormProvider: Box, useWatch: () => "CONFIRMED" },
    "semantic-ui-react": { Form: (props) => { form = props; return React.createElement(Box, props); } },
  }).default;
  const rows = [{ id: "B1", state: "HARD_DELETED" }];
  const submit = () => {};
  renderToStaticMarkup(React.createElement(Page, { budgets: rows, list: {
    ...a.state, appliedFilters: { state: "CONFIRMED" }, methods: {}, onSubmit: submit,
  } }));
  assert.equal(table.elements, rows, "do not remove rows from a backend page");
  assert.deepEqual(Array.from(table.headers.filter((header) => header.sortable), (header) => header.key), ["id", "date"]);
  for (const key of ["customer", "total", "paidAmount", "pendingAmount", "createdBy"]) assert.equal(table.headers.find((h) => h.key === key).sortable, false);
  assert.equal(table.onFilter, undefined);
  assert.equal(table.onDownloadExcel, undefined);
  assert.equal(form.onSubmit, submit);
  assert.ok(controls.every((control) => control.afterChange === undefined));
});

test("Customer catalog loads exactly 3 numeric pages for 1200 items, ignoring compatibility cursors", async (t) => {
  const a = setup(t);
  const data = await a.client.fetchQuery(a.customers.customerCatalogOptions());
  assert.equal(data.customers.length, 1200);
  assert.deepEqual(a.calls.map(({ params }) => params.pageNumber), [1, 2, 3]);
  assert.deepEqual(a.calls.map(({ params }) => params.count), [true, false, false]);
  assert.ok(a.calls.every(({ url, params }) => url === "customers" && params.pageSize === 500 && !Object.hasOwn(params, "LastEvaluatedKey")));
});

test("Customer catalog failure publishes no partial collection and permits a fresh retry", async (t) => {
  const a = setup(t);
  const options = a.customers.customerCatalogOptions();
  a.fail(2);
  await assert.rejects(a.client.fetchQuery(options), /Page failed/);
  assert.equal(a.calls.length, 2);
  assert.equal(a.client.getQueryData(options.queryKey), undefined);
  a.fail(undefined);
  assert.equal((await a.client.fetchQuery(options)).customers.length, 1200);
  assert.deepEqual(a.calls.slice(2).map(({ params }) => params.pageNumber), [1, 2, 3]);
});

test("Customer mutations retire local writes and invalidate the numeric catalog; Budget mutations recount active Sales", async (t) => {
  const a = setup(t);
  const catalogKey = a.customers.customerCatalogOptions().queryKey;
  for (const hook of ["useCreateCustomer", "useEditCustomer", "useDeleteCustomer", "useSetCustomerState"]) {
    a.client.setQueryData(catalogKey, { customers: [] });
    await a.hook(a.customers[hook])(hook === "useDeleteCustomer" ? "C1" : { id: "C1" });
    assert.equal(a.client.getQueryState(catalogKey).isInvalidated, true);
  }
  const observer = new QueryObserver(a.client, a.options());
  t.after(observer.subscribe(() => {}));
  await settled(observer);
  for (const hook of ["useCreateBudget", "useEditBudget", "useConfirmBudget", "useConfirmBudgetDiscount", "useCancelBudget"]) {
    const before = a.calls.length;
    await a.hook(a.api[hook])({ id: "B1" }, "B1");
    assert.equal(a.calls.length, before + 1, hook);
    assert.equal(a.calls.at(-1).params.count, true, hook);
  }
});
