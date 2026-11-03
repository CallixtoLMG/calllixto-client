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
  ALL: "all", ENTITIES: { EXPENSES: "expenses", EXPENSE: "expense", PAYMENTS: "payments", BUDGET: "budget" },
  IN_MS: {}, CONTENT_SIZES: {}, FIELD_LABELS: {}, ICONS: {}, COLORS: {}, SHORTKEYS: {},
  SELECT_ALL_OPTION: { value: "all" }, SORTING: { ASC: "ascending", DESC: "descending" },
  DEFAULT_PAGE_SIZE: 20, PAGE_SIZE_OPTIONS: [{ value: 20 }, { value: 100 }], PAGES: { EXPENSES: {} },
};
const plain = (value) => JSON.parse(JSON.stringify(value));
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
const expenseConstants = load("src/components/expenses/expenses.constants.js", {
  "@/common/constants": constants, "@/common/components/custom": { Box, Flex: Box, OverflowWrapper: Box },
  "@/common/components/form": { PriceLabel: Box }, "@/common/components/tooltips": { CommentTooltip: Box, TagsTooltip: Box },
  "@/common/utils": {}, "semantic-ui-react": { Label: Box },
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
const setup = (t, respond) => {
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false } } });
  t.after(() => client.clear());
  const calls = [], mutations = [];
  let mutationResult = { statusOk: true };
  const axios = { getInstance: () => ({ get: async (url, options) => {
    calls.push({ url, ...options });
    if (respond) return { data: respond(options.params) };
    return { data: { statusOk: true, expenses: [{ id: `A${options.params.pageNumber}` }],
      ...(options.params.count && { count: 40 }), LastEvaluatedKey: { id: "compatibility-only" } } };
  } }) };
  const paged = load("src/api/pagedLists.js", { "./axios": axios });
  const common = Object.fromEntries(["useCreateItem", "useEditItem", "useDeleteItem"].map((name) => [name, () => async (options) => {
    mutations.push(options);
    assert.equal(options.skipStorageUpdate, true);
    return mutationResult;
  }]));
  const api = load("src/api/expenses.js", {
    "@/common/constants": constants, "@/fetchUrls": { PATHS: constants.ENTITIES, CANCEL: "cancel" },
    "../components/expenses/expenses.constants": expenseConstants, "./axios": axios, "./common": common,
    "./pagedLists": { ...paged, usePagedList: (state) => state },
  });
  const payments = load("src/api/payments.js", {
    "@/common/constants": constants, "@/components/payments/payments.constants": { GET_PAYMENT_QUERY_KEY: "getPayments" },
    "@/fetchUrls": { PATHS: constants.ENTITIES }, "./axios": axios, "./common": common, "./pagedLists": paged,
  });
  const state = { appliedFilters: { ...expenseConstants.EMPTY_FILTERS }, pageNumber: 1, pageSize: 20, sort: "id", order: "asc", hydrated: true };
  const options = (value = state) => paged.serverListQueryOptions(client, api.usePagedExpenses(api.getExpenseListState(value)));
  const hook = (fn) => {
    let result;
    const Probe = () => { result = fn(); return null; };
    renderToStaticMarkup(React.createElement(QueryClientProvider, { client }, React.createElement(Probe)));
    return result;
  };
  return { client, calls, mutations, paged, api, payments, state, options, hook,
    failMutation: () => { mutationResult = { statusOk: false }; } };
};

const renderRoute = (a, list, query = {}) => {
  let configuration, page;
  const downloads = [], errors = [];
  const Route = load("src/app/(private)/gastos/page.jsx", {
    "@/User": { useUserContext: () => ({ role: "viewer" }) },
    "@/api/expenses": { ...a.api, usePagedExpenses: () => ({ total: 0, isFetching: false, ...query }) },
    "@/api/pagedLists": a.paged, "@/common/constants": constants,
    "@/common/utils": { downloadExcel: (...args) => downloads.push(args) },
    "@/components/expenses/ExpensesPage": { default: (props) => { page = props; return null; } },
    "@/components/expenses/expenses.constants": expenseConstants,
    "@/components/layout": { useBreadcrumContext: () => ({ setLabels() {} }) }, "@/hooks": { useKeyboardShortcuts() {} },
    "@/hooks/useServerListFilters": { default: (config) => { configuration = config; return list; } },
    "@/roles": { RULES: { canCreate: {} } }, "next/navigation": { useRouter: () => ({ push() {} }) },
    "react-hot-toast": { toast: { error: (message) => errors.push(message) } },
  }).default;
  renderToStaticMarkup(React.createElement(QueryClientProvider, { client: a.client }, React.createElement(Route)));
  return { configuration, page, downloads, errors,
    exportAction: page.sideActions.find((action) => action.id === "download-excel") };
};

test("Expenses sends numeric pages, reuses count and ignores compatibility cursors", async (t) => {
  const a = setup(t);
  const observer = new QueryObserver(a.client, a.options());
  t.after(observer.subscribe(() => {}));
  await settled(observer);
  assert.equal(a.calls[0].url, "expenses");
  assert.deepEqual(plain(a.calls[0].params), { pageNumber: 1, pageSize: 20, sort: "id", order: true, count: true });
  observer.setOptions(a.options({ ...a.state, pageNumber: 2 }));
  await settled(observer);
  assert.deepEqual(plain(a.calls[1].params), { pageNumber: 2, pageSize: 20, sort: "id", order: true, count: false });
  assert.equal(a.calls.length, 2);
});

test("Expenses applies only confirmed filters on Buscar, omits categories and Todos, and recounts on reset", async (t) => {
  const a = setup(t);
  const observer = new QueryObserver(a.client, a.options());
  t.after(observer.subscribe(() => {}));
  await settled(observer);
  const draft = { id: "A1", name: "Internet", state: "PENDING", categories: "Servicios" };
  assert.equal(a.calls.length, 1);
  const applied = filters.applyServerListFilters({ ...a.state, pageNumber: 2 }, draft, expenseConstants.EMPTY_FILTERS);
  observer.setOptions(a.options(applied));
  await settled(observer);
  assert.deepEqual(plain(a.calls[1].params), { id: "A1", name: "Internet", state: "PENDING", pageNumber: 1, pageSize: 20, sort: "id", order: true, count: true });
  assert.equal(a.api.getExpenseListState({ ...a.state, appliedFilters: draft }).appliedFilters.categories, undefined);
  assert.deepEqual(plain(a.api.getExpenseListState({ ...a.state, appliedFilters: { name: "all", state: "all" } }).appliedFilters), { name: "all" });
  const reset = filters.applyServerListFilters(applied, expenseConstants.EMPTY_FILTERS, expenseConstants.EMPTY_FILTERS);
  await a.paged.refreshServerList(a.client, "expenses", a.api.getExpenseListState(reset));
  observer.setOptions(a.options(reset));
  await settled(observer);
  assert.equal(a.calls.length, 3);
  assert.equal(a.calls[2].params.count, true);
  assert.equal(a.calls[2].params.state, undefined);
});

test("Expenses whitelist contains only ID and adapts ASC/DESC locally", async (t) => {
  const a = setup(t);
  const configuration = { defaultFilters: expenseConstants.EMPTY_FILTERS, sortFields: expenseConstants.EXPENSE_SORT_FIELDS };
  assert.deepEqual(plain(configuration.sortFields), { id: "id" });
  for (const key of ["name", "amount", "categories", "paidAmount", "pendingAmount"]) {
    assert.equal(filters.getServerListState(configuration, { sorting: { key } }).sort, "id");
  }
  for (const [order, expected] of [["asc", true], ["desc", false]]) {
    await a.client.fetchQuery(a.options({ ...a.state, order }));
    assert.equal(a.calls.at(-1).params.order, expected);
    assert.equal(a.calls.at(-1).params.sort, "id");
  }
});

test("Expenses table passes the backend page intact and disables categories and automatic submits", (t) => {
  const a = setup(t);
  let table, form, category;
  const controls = [];
  const Page = load("src/components/expenses/ExpensesPage/index.jsx", {
    "@/common/components/form": { TextControlled: Box, DropdownControlled: (props) => { controls.push(props); return null; },
      DropdownField: (props) => { category = props; return null; } },
    "@/common/components/table": { Filters: Box, Table: (props) => { table = props; return null; } },
    "@/common/constants": constants, "@/components/layout": { useListPageSideActions() {} },
    "../expenses.constants": expenseConstants, "react-hook-form": { FormProvider: Box },
    "semantic-ui-react": { Form: (props) => { form = props; return React.createElement(Box, props); } },
  }).default;
  const rows = [{ id: "A1", state: "HARD_DELETED", categories: [] }];
  const submit = () => {};
  renderToStaticMarkup(React.createElement(Page, { expenses: rows, list: { ...a.state, methods: {}, onSubmit: submit } }));
  assert.equal(table.elements, rows);
  for (const prop of ["onFilter", "onDownloadExcel", "onFilteredElementsChange", "filters", "setFilters"]) assert.equal(table[prop], undefined);
  assert.equal(form.onSubmit, submit);
  assert.ok(controls.every((control) => control.afterChange === undefined));
  assert.equal(category.disabled, true);
  assert.match(category.label, /no disponible/);
  assert.deepEqual(Array.from(table.headers.filter((h) => h.sortable), (h) => h.key), ["id"]);
  assert.ok(table.headers.every((h) => h.sortValue === undefined));
});

test("Expenses filter apply uses the same boolean-order identity and disables export while the list is unavailable", async (t) => {
  const a = setup(t);
  const restored = { ...a.state, appliedFilters: { state: "all", categories: "Servicios" } };
  const { configuration, page } = renderRoute(a, restored);
  const observer = new QueryObserver(a.client, a.options());
  t.after(observer.subscribe(() => {}));
  await settled(observer);
  await configuration.onApply(restored);
  assert.equal(a.calls.length, 2);
  assert.equal(a.calls[1].params.count, true);
  assert.equal(page.list.appliedCount, 0);
  for (const [hydrated, query] of [[false, { total: 34 }], [true, { total: 34, isFetching: true }], [true, { total: null }], [true, { total: 0 }]]) {
    const { exportAction } = renderRoute(a, { ...restored, hydrated }, query);
    assert.equal(exportAction.disabled, true);
    await exportAction.onClick();
  }
  assert.equal(a.calls.length, 2);
});

test("Expenses Excel exports the 34 applied matches out of 50, ignores draft and formats all rows", async (t) => {
  const dataset = Array.from({ length: 50 }, (_, i) => ({
    id: `A${String(i + 1).padStart(4, "0")}`,
    name: i < 34 ? "Internet" : "Telefonía",
    categories: i === 0 ? undefined : [{ name: "Servicios" }, { name: "Oficina" }],
    amount: 500 + i,
    state: "PENDING",
    comments: `Gasto ${i + 1}`,
  }));
  const a = setup(t, ({ id, name, state, pageNumber, pageSize, count, order }) => {
    const matches = dataset.filter((expense) => expense.id.includes(id) && expense.name === name && expense.state === state);
    if (!order) matches.reverse();
    return { statusOk: true, expenses: matches.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
      ...(count && { count: matches.length }) };
  });
  const appliedFilters = { id: "A", name: "Internet", state: "PENDING", categories: "Ignorada" };
  const list = { ...a.state, pageNumber: 2, appliedFilters, order: "desc", methods: { getValues: () => ({ name: "Telefonía" }) } };
  const matches = dataset.slice(0, 34).reverse();
  const { exportAction, downloads, errors } = renderRoute(a, list, { total: 34, data: { items: matches.slice(20) } });
  assert.equal(exportAction.disabled, false);
  await exportAction.onClick();
  assert.deepEqual(plain(a.calls.map(({ params }) => params)), [1, 2].map((pageNumber) => ({
    id: "A", name: "Internet", state: "PENDING", sort: "id", order: false, pageNumber, pageSize: 20, count: pageNumber === 1,
  })));
  assert.deepEqual(errors, []);
  assert.deepEqual(plain(downloads), [[[
    ["ID", "Nombre", "Categorias", "Monto", "Estado", "Comentarios"],
    ...matches.map(({ id, amount, comments, categories }) => [id, "Internet", categories ? "Servicios, Oficina" : "", amount, "Pendiente", comments]),
  ], "Lista de Gastos"]]);
});

test("Expenses Excel writes nothing when a later page fails, is incomplete or repeats an ID", async (t) => {
  const firstPage = Array.from({ length: 20 }, (_, i) => ({ id: `A${i + 1}` }));
  for (const [secondPage, message] of [
    [{ statusOk: false, message: "Falló la página" }, /Falló la página/],
    [{ statusOk: true, expenses: [] }, /listado completo/],
    [{ statusOk: true, expenses: [firstPage[0]] }, /registros repetidos/],
  ]) {
    const a = setup(t, ({ pageNumber }) => pageNumber === 1
      ? { statusOk: true, expenses: firstPage, count: 21 } : secondPage);
    const { exportAction, downloads, errors } = renderRoute(a, a.state, { total: 21 });
    await exportAction.onClick();
    assert.deepEqual(a.calls.map(({ params }) => params.pageNumber), [1, 2]);
    assert.deepEqual(downloads, []);
    assert.equal(errors.length, 1);
    assert.match(errors[0], message);
  }
});

test("Expense create/edit/cancel skip Dexie and recount active pages only on success", async (t) => {
  const a = setup(t);
  const observer = new QueryObserver(a.client, a.options());
  t.after(observer.subscribe(() => {}));
  await settled(observer);
  for (const hook of ["useCreateExpense", "useEditExpense", "useCancelExpense"]) {
    const before = a.calls.length;
    await a.hook(a.api[hook])({ id: "A1", cancelData: { cancelledMsg: "test" } });
    assert.equal(a.calls.length, before + 1);
    assert.equal(a.calls.at(-1).params.count, true);
    assert.equal(a.mutations.at(-1).entity, "expenses");
    if (hook !== "useCreateExpense") assert.deepEqual(plain(a.mutations.at(-1).invalidateQueries), [[expenseConstants.GET_EXPENSE_QUERY_KEY, "A1"]]);
  }
  a.failMutation();
  const before = a.calls.length;
  for (const hook of ["useCreateExpense", "useEditExpense", "useCancelExpense"]) await a.hook(a.api[hook])({ id: "A1" });
  assert.equal(a.calls.length, before);
});

test("Expense payments create/edit/delete refresh Expenses and count without changing other entities", async (t) => {
  const a = setup(t);
  const observer = new QueryObserver(a.client, a.options());
  t.after(observer.subscribe(() => {}));
  await settled(observer);
  for (const hook of ["useCreatePayment", "useEditPayment", "useDeletePayment"]) {
    const mutate = a.hook(a.payments[hook]);
    const before = a.calls.length;
    const value = hook === "useDeletePayment" ? "P1" : { id: "P1", amount: 100 };
    await mutate(value, "expense", "A1");
    assert.equal(a.calls.length, before + 1);
    assert.equal(a.calls.at(-1).params.count, true);
    assert.deepEqual(plain(a.mutations.at(-1).invalidateQueries), [["getPayments", "A1"]]);
    assert.ok(a.mutations.at(-1).url.startsWith("payments/expense/A1"));
    await mutate(value, "budget", "B1");
    assert.equal(a.calls.length, before + 1);
  }
  a.failMutation();
  const before = a.calls.length;
  for (const hook of ["useCreatePayment", "useEditPayment", "useDeletePayment"]) await a.hook(a.payments[hook])({ id: "P1" }, "expense", "A1");
  assert.equal(a.calls.length, before);
});
