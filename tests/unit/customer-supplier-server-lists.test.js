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
const Box = ({ children }) => React.createElement("div", null, children);
const constants = {
  ENTITIES: { CUSTOMERS: "customers", SUPPLIERS: "suppliers" }, IN_MS: { ONE_HOUR: 3600000 },
  SORTING: { ASC: "ascending", DESC: "descending" }, CONTENT_SIZES: {}, FIELD_LABELS: {},
  PAGES: { CUSTOMERS: {}, SUPPLIERS: {} },
};
const load = (file, dependencies) => {
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

for (const config of [
  { entity: "customers", singular: "Customer", component: "CustomersPage", sortKey: "CUSTOMER_SORT_FIELDS", headers: "HEADERS", filters: { name: "Ana", state: "ACTIVE" } },
  { entity: "suppliers", singular: "Supplier", component: "SuppliersPage", sortKey: "SUPPLIER_SORT_FIELDS", headers: "SUPPLIERS_COLUMNS", filters: { id: "SE", name: "Suministro", state: "ACTIVE" } },
]) {
  const collection = config.component.replace("Page", "");
  const createAdapter = (t) => {
    const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false } } });
    const calls = [];
    let failExport = false;
    let mutationResult = { statusOk: true };
    const axios = { getInstance: () => ({ get: async (url, options) => {
      calls.push({ url, ...options });
      const { pageNumber, pageSize } = options.params;
      if (failExport && pageNumber === 2) return { data: { statusOk: false, message: "Page failed" } };
      const length = pageSize === 500 ? (pageNumber === 3 ? 200 : 500) : 1;
      return { data: { statusOk: true, [config.entity]: Array.from({ length }, (_, id) => ({ id })), count: "1200" } };
    } }) };
    const paged = load("src/api/pagedLists.js", { "./axios": axios });
    const tooltipComponents = { AddressesTooltip: Box, CommentTooltip: Box, PhonesTooltip: Box, TagsTooltip: Box };
    const entityConstants = load(`src/components/${config.entity}/${config.entity}.constants.js`, {
      "@/common/components/custom": { Box, Flex: Box, FlexColumn: Box, Label: Box, OverflowWrapper: Box },
      "@/common/constants": constants, "@/common/utils": {}, "semantic-ui-react": { Popup: Box },
      "@/common/components/tooltips": tooltipComponents, "../../common/components/tooltips": tooltipComponents,
    });
    const common = {
      listItems: () => { throw new Error("Paged adapter entered the legacy catalogue"); },
      ...Object.fromEntries(["useCreateItem", "useDeleteItem", "useEditItem", "usePostUpdateItem"].map((name) => [name, () => async () => mutationResult])),
    };
    const api = load(`src/api/${config.entity}.js`, {
      "@/common/constants": constants, "@/common/utils": {}, "@/fetchUrls": { PATHS: constants.ENTITIES },
      [`@/components/${config.entity}/${config.entity}.constants`]: entityConstants,
      "./axios": axios, "./common": common, "./pagedLists": { ...paged, usePagedList: (options) => options },
    });
    const state = { appliedFilters: config.filters, pageNumber: 1, pageSize: 20, sort: "id", order: "asc", hydrated: true };
    const options = (value) => paged.serverListQueryOptions(client, api[`usePaged${collection}`](value));
    t.after(() => client.clear());
    return { client, calls, entityConstants, api, state, options, failExport: () => { failExport = true; }, failMutation: () => { mutationResult = { statusOk: false }; } };
  };

  test(`${collection}: paged request, allowed sorting and CRUD invalidations use the entity adapter`, async (t) => {
    const adapter = createAdapter(t);
    const observer = new QueryObserver(adapter.client, adapter.options(adapter.state));
    t.after(observer.subscribe(() => {}));
    await settled(observer);
    assert.equal(adapter.calls.length, 1);
    assert.equal(adapter.calls[0].url, config.entity);
    assert.deepEqual(JSON.parse(JSON.stringify(adapter.calls[0].params)), {
      ...config.filters, pageNumber: 1, pageSize: 20, sort: "id", order: "asc", count: true,
    });
    observer.setOptions(adapter.options({ ...adapter.state, pageNumber: 2 }));
    await settled(observer);
    assert.equal(adapter.calls.length, 2);
    assert.equal(adapter.calls[1].params.pageNumber, 2);
    assert.equal(adapter.calls[1].params.name, config.filters.name);
    assert.equal(adapter.calls[1].params.count, false);
    const sortFields = adapter.entityConstants[config.sortKey];
    observer.setOptions(adapter.options({ ...adapter.state, sort: sortFields.name, order: "desc" }));
    await settled(observer);
    assert.equal(adapter.calls.length, 3);
    assert.equal(adapter.calls[2].params.sort, "name");
    assert.equal(adapter.calls[2].params.order, "desc");
    assert.equal(adapter.calls[2].params.pageNumber, 1);
    assert.equal(adapter.calls[2].params.count, false);
    let mutate;
    for (const action of ["Create", "Edit", "Delete", "Set"]) {
      const hook = `use${action}${config.singular}${action === "Set" ? "State" : ""}`;
      const Probe = () => { mutate = adapter.api[hook](); return null; };
      renderToStaticMarkup(React.createElement(QueryClientProvider, { client: adapter.client }, React.createElement(Probe)));
      const before = adapter.calls.length;
      await mutate(action === "Delete" ? "A" : { id: "A", state: "INACTIVE" });
      assert.equal(adapter.calls.length, before + 1);
      assert.equal(adapter.calls.at(-1).params.count, true);
    }
    adapter.failMutation();
    const afterSuccess = adapter.calls.length;
    await mutate({ id: "A" });
    assert.equal(adapter.calls.length, afterSuccess);
  });

  test(`${collection}: remote table disables address sorting and dropdowns wait for form submit`, (t) => {
    const adapter = createAdapter(t);
    let table;
    let form;
    let dropdown;
    const Page = load(`src/components/${config.entity}/${config.component}/index.jsx`, {
      "@/common/constants": constants, [`../${config.entity}.constants`]: adapter.entityConstants,
      "@/common/components/form": { TextControlled: Box, DropdownControlled: (props) => { dropdown = props; return null; } },
      "@/common/components/table": { Filters: Box, Table: (props) => { table = props; return null; } },
      "@/components/layout": { useListPageSideActions() {} }, "react-hook-form": { FormProvider: Box },
      "semantic-ui-react": { Form: (props) => { form = props; return React.createElement(Box, props); } },
    }).default;
    const submit = () => {};
    renderToStaticMarkup(React.createElement(Page, {
      list: { ...adapter.state, hydrated: false, methods: {}, onSubmit: submit }, total: 1200,
    }));
    assert.equal(form.onSubmit, submit);
    assert.equal(dropdown.afterChange, undefined);
    assert.equal(dropdown.clearable, true);
    assert.equal(table.serverPagination.hydrated, false);
    assert.equal(table.onFilter, undefined);
    assert.equal(table.onDownloadExcel, undefined);
    assert.equal(table.headers.find(({ key }) => key === "addresses").sortable, false);
    assert.equal(table.serverPagination.sortFields.addresses, undefined);
    assert.deepEqual(JSON.parse(JSON.stringify(table.serverPagination.sortFields)), { id: "id", name: "name", state: "state" });
    assert.equal(table.headers, adapter.entityConstants[config.headers]);
    assert.ok(Object.values(adapter.entityConstants.EMPTY_FILTERS).every((value) => value === ""));
  });

  test(`${collection}: export loads every applied match and aborts on a failed page`, async (t) => {
    const adapter = createAdapter(t);
    const fetchAll = adapter.api[`fetch${collection}ForExport`];
    const items = await fetchAll({ ...adapter.state, pageNumber: 4, draft: { name: "Pending" } });
    assert.equal(items.length, 1200);
    assert.deepEqual(adapter.calls.map(({ params }) => params.pageNumber), [1, 2, 3]);
    assert.deepEqual(adapter.calls.map(({ params }) => params.count), [true, false, false]);
    assert.ok(adapter.calls.every(({ params }) => params.pageSize === 500 && params.name === config.filters.name));
    if (config.entity === "suppliers") assert.ok(adapter.calls.every(({ params }) => params.id === "SE"));
    adapter.calls.length = 0;
    adapter.failExport();
    await assert.rejects(fetchAll(adapter.state), /Page failed/);
    assert.equal(adapter.calls.length, 2);
  });
}
