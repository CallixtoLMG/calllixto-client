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
  ENTITIES: { PRODUCTS: "products", PRODUCT: "product", SETTINGS: "settings", BRANDS: "brands", SUPPLIERS: "suppliers" },
  IN_MS: { ONE_DAY: 86400000, ONE_HOUR: 3600000 }, COLORS: {}, ICONS: {}, FIELD_LABELS: {},
  CONTENT_SIZES: {}, BUTTON_TEXTS: {}, DATE_FORMATS: {}, POPUP_POSITIONS: {}, SIZES: {},
  SORTING: { ASC: "ascending", DESC: "descending" }, PAGES: { PRODUCTS: {} }, TOOLTIPS: {},
};
const load = (file, dependencies) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, { module, exports: module.exports, console,
    require: (name) => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name),
  }, { filename: file });
  return module.exports;
};
const plain = (value) => JSON.parse(JSON.stringify(value));
const productUtils = load("src/components/products/products.utils.js", { "./products.constants": { PRODUCT_STATES: {} } });
const productConstants = load("src/components/products/products.constants.js", {
  "@/common/constants": constants, "@/common/constants/routes": { BUDGETS_PAGE: {} },
  "@/common/components/custom": { Box, Flex: Box, FlexColumn: Box, Icon: Box, Label: Box, OverflowWrapper: Box },
  "@/common/components/form/Search/styles": { Text: Box }, "@/common/components/tooltips": {},
  "@/common/utils": {}, "@/common/utils/dates": {}, "semantic-ui-react": { Popup: Box },
  "../../common/components/form": { PriceLabel: Box }, "./products.utils": productUtils,
});

test("BudgetForm imports successfully and builds attributes from the shared product contract", () => {
  const file = "src/components/budgets/BudgetForm/index.jsx";
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX);
  const dependencies = Object.fromEntries(source.statements.filter(ts.isImportDeclaration)
    .map(({ moduleSpecifier }) => moduleSpecifier.text)
    .filter((name) => name.startsWith("@/") || name.startsWith("."))
    .map((name) => [name, {}]));
  dependencies["@/components/products/products.constants"] = productConstants;
  dependencies["semantic-ui-react"] = {};
  const BudgetForm = load(file, dependencies).default;
  assert.ok(Array.isArray(productConstants.LIST_ATTRIBUTES));
  assert.equal(typeof BudgetForm, "function");
});

const createAdapter = (t, total = 1200) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  t.after(() => client.clear());
  const calls = [];
  let failPage;
  let mutationResult = { statusOk: true, deletedCount: 1 };
  const axios = { getInstance: () => ({
    get: async (url, options = {}) => {
      calls.push({ url, ...options });
      if (url === "settings") return { data: { statusOk: true, settings: [{ entity: "products" }] } };
      const { pageNumber, pageSize, supplierId = "ALL" } = options.params;
      if (pageNumber === failPage) throw new Error("Page failed");
      const length = Math.max(0, Math.min(pageSize, total - (pageNumber - 1) * pageSize));
      return { data: { statusOk: true, [url]: Array.from({ length }, (_, i) => ({ id: `${supplierId}-${pageNumber}-${i}` })),
        count: String(total), LastEvaluatedKey: { id: "ignored" } } };
    },
    delete: async () => ({ data: mutationResult }),
  }) };
  const paged = load("src/api/pagedLists.js", { "./axios": axios });
  const catalogs = load("src/api/productCatalogs.js", {
    "@/common/constants": constants, "@/components/products/products.utils": productUtils,
    "@/fetchUrls": { PATHS: constants.ENTITIES }, "./pagedLists": paged,
  });
  const common = Object.fromEntries(["useCreateItem", "useEditItem", "useDeleteItem", "usePostUpdateItem", "useBatchDeleteItem"]
    .map((name) => [name, () => async () => mutationResult]));
  const actualCommon = load("src/api/common.js", {
    "@/common/constants": constants, "@/common/utils": {}, "@/common/utils/dates": {}, "@/db": {}, "./axios": axios,
  });
  common.useBatchDeleteItem = actualCommon.useBatchDeleteItem;
  const api = load("src/api/products.js", {
    "@/common/constants": constants, "@/components/products/products.constants": productConstants,
    "@/fetchUrls": { PATHS: constants.ENTITIES, SUPPLIER: "supplier" }, "./axios": axios,
    "./pagedLists": { ...paged, usePagedList: (state) => state }, "./productCatalogs": catalogs, "./common": common,
  });
  const hook = (fn) => {
    let result;
    const Probe = () => { result = fn(); return null; };
    renderToStaticMarkup(React.createElement(QueryClientProvider, { client }, React.createElement(Probe)));
    return result;
  };
  return { client, calls, paged, catalogs, api, hook, common, axios,
    fail: (page) => { failPage = page; }, failMutation: () => { mutationResult = { statusOk: false }; } };
};

for (const total of [500, 1200]) {
  test(`product catalog: ${total} items, finite numeric pages, ignores compatibility cursor`, async (t) => {
    const { client, calls, catalogs } = createAdapter(t, total);
    const result = await client.fetchQuery(catalogs.productCatalogOptions());
    assert.equal(result.products.length, total);
    assert.deepEqual(calls.map(({ params }) => params.pageNumber), total === 500 ? [1] : [1, 2, 3]);
    assert.deepEqual(calls.map(({ params }) => params.count), total === 500 ? [true] : [true, false, false]);
    assert.ok(calls.every(({ params }) => params.pageSize === 500 && !Object.hasOwn(params, "LastEvaluatedKey")));
  });
}

test("catalog failure publishes no partial collection, stops, and permits retry", async (t) => {
  const { client, calls, catalogs, fail } = createAdapter(t);
  fail(2);
  await assert.rejects(client.fetchQuery(catalogs.productCatalogOptions()), /Page failed/);
  assert.equal(client.getQueryData(catalogs.productCatalogKeys.all), undefined);
  assert.equal(calls.length, 2);
  fail(undefined);
  assert.equal((await client.fetchQuery(catalogs.productCatalogOptions())).products.length, 1200);
  assert.deepEqual(calls.slice(2).map(({ params }) => params.pageNumber), [1, 2, 3]);
});

test("supplier tools reuse one complete cache per supplier, never share suppliers", async (t) => {
  const { client, calls, catalogs } = createAdapter(t);
  const first = await client.fetchQuery(catalogs.supplierProductsOptions("VA"));
  const nextTool = await client.fetchQuery(catalogs.supplierProductsOptions("VA"));
  assert.equal(first, nextTool);
  assert.equal(calls.length, 3);
  assert.deepEqual(calls.map(({ params }) => params.count), [true, false, false]);
  assert.ok(calls.every(({ params }) => params.supplierId === "VA" && params.pageSize === 500));
  await client.fetchQuery(catalogs.supplierProductsOptions("XX"));
  assert.equal(calls.length, 6);
  assert.ok(calls.slice(3).every(({ params }) => params.supplierId === "XX"));
  assert.equal(client.getQueryData(catalogs.productCatalogKeys.all), undefined);
});

test("failed supplier page aborts before tool runs and leaves no partial cache", async (t) => {
  const { client, calls, catalogs, fail } = createAdapter(t);
  let executed = false;
  fail(2);
  await assert.rejects(client.fetchQuery(catalogs.supplierProductsOptions("VA")).then(() => { executed = true; }), /Page failed/);
  assert.equal(executed, false);
  assert.equal(calls.length, 2);
  assert.equal(client.getQueryData(catalogs.productCatalogKeys.supplier("VA")), undefined);
  fail(undefined);
  assert.equal((await client.fetchQuery(catalogs.supplierProductsOptions("VA"))).length, 1200);
});

test("products list adapter sends filters, paging and sorting; export uses all applied matches", async (t) => {
  const { client, calls, paged, api } = createAdapter(t);
  const state = { appliedFilters: { id: "VA", name: "Papel", state: "ACTIVE" },
    pageNumber: 1, pageSize: 20, sort: "name", order: "desc", hydrated: true };
  await client.fetchQuery(paged.serverListQueryOptions(client, api.usePagedProducts(state)));
  await client.fetchQuery(paged.serverListQueryOptions(client, api.usePagedProducts({ ...state, pageNumber: 2 })));
  assert.deepEqual(plain(calls[0].params), { ...state.appliedFilters, pageNumber: 1, pageSize: 20, sort: "name", order: "desc", count: true });
  assert.equal(calls[1].params.count, false);
  assert.equal(calls[1].params.pageNumber, 2);
  assert.equal((await api.fetchProductsForExport({ ...state, draft: { name: "Ignored" } })).length, 1200);
  assert.ok(calls.every(({ params }) => params.name === "Papel" && params.id === "VA" && params.state === "ACTIVE"));
  assert.deepEqual(calls.slice(2).map(({ params }) => params.pageNumber), [1, 2, 3]);
  assert.deepEqual(plain(productConstants.PRODUCT_SORT_FIELDS), { id: "id", name: "name" });
});

test("CRUD and supplier deletion invalidate the affected supplier, catalog and visible list", async (t) => {
  const { client, calls, paged, catalogs, api, hook, failMutation } = createAdapter(t, 1);
  const filters = { id: "", name: "", state: "" };
  const state = { appliedFilters: filters, pageNumber: 1, pageSize: 20, hydrated: true };
  const observer = new QueryObserver(client, paged.serverListQueryOptions(client, api.usePagedProducts(state)));
  t.after(observer.subscribe(() => {}));
  await observer.refetch();
  const va = catalogs.productCatalogKeys.supplier("VA");
  const xx = catalogs.productCatalogKeys.supplier("XX");
  for (const [name, value] of [
    ["useCreateProduct", { id: "VABB001" }], ["useEditProduct", { id: "VABB001" }],
    ["useDeleteProduct", "VABB001"], ["useSetProductState", { id: "VABB001" }],
    ["useRecoverProduct", { id: "VABB001" }], ["useBatchDeleteProducts", ["VABB001"]], ["useDeleteBySupplierId", "VA"],
  ]) {
    client.setQueryData(va, []); client.setQueryData(xx, []); client.setQueryData(catalogs.productCatalogKeys.all, { products: [] });
    const before = calls.length;
    await hook(api[name])(value);
    assert.equal(client.getQueryState(va).isInvalidated, true, name);
    assert.equal(client.getQueryState(xx).isInvalidated, false, name);
    assert.equal(client.getQueryState(catalogs.productCatalogKeys.all).isInvalidated, true, name);
    assert.equal(calls.length, before + 1, name);
    assert.equal(calls.at(-1).params.count, true, name);
  }
  client.setQueryData(va, []);
  failMutation();
  await hook(api.useEditProduct)({ id: "VABB001" });
  assert.equal(client.getQueryState(va).isInvalidated, false);
});

test("Settings uses one direct GET without a count contract", async (t) => {
  const a = createAdapter(t);
  const api = load("src/api/settings.js", { "@/common/constants": constants,
    "@/fetchUrls": { PATHS: constants.ENTITIES }, "./axios": a.axios, "./common": a.common,
    "../components/settings/settings.constants": { LIST_SETTINGS_QUERY_KEY: "settings", GET_SETTING_QUERY_KEY: "setting" },
  });
  a.hook(api.useListSettings);
  const query = a.client.getQueryCache().find({ queryKey: ["settings"] });
  const data = await a.client.fetchQuery(query.options);
  assert.deepEqual(plain(data.settings), [{ entity: "products" }]);
  assert.equal(a.calls.length, 1);
  assert.equal(a.calls[0].url, "settings");
  assert.equal(a.calls[0].params, undefined);
});

test("Brand/Supplier dropdown catalogs keep complete numeric collections", async (t) => {
  for (const entity of ["brands", "suppliers"]) {
    const a = createAdapter(t);
    const name = entity === "brands" ? "Brands" : "Suppliers";
    const api = load(`src/api/${entity}.js`, {
      "@/common/constants": constants, "@/fetchUrls": { PATHS: constants.ENTITIES },
      [`@/components/${entity}/${entity}.constants`]: { [`LIST_${entity.toUpperCase()}_QUERY_KEY`]: entity },
      "./axios": a.axios, "./common": a.common, "./pagedLists": a.paged,
    });
    a.hook(api[`useList${name}`]);
    const query = a.client.getQueryCache().find({ queryKey: [entity] });
    const result = await a.client.fetchQuery(query.options);
    assert.equal(result[entity].length, 1200);
    assert.deepEqual(a.calls.map(({ params }) => params.pageNumber), [1, 2, 3]);
  }
});

test("strict association policy blocks missing, null, strings and numbers", () => {
  for (const flag of [true, false, undefined, null, "false", "true", 0, 1]) {
    const state = productUtils.getProductAssociation(flag);
    assert.equal(state.canUseProductTools, flag === true);
    assert.equal(state.canDeleteEntity, flag === false);
  }
});

test("disabled stock/import trigger has no click handler or loading spinner", () => {
  let button;
  const { BatchImport } = load("src/components/products/BatchImport/index.jsx", {
    "@/common/constants": constants,
    "@/common/components/custom": { Button: (props) => { button = props; return null; } },
    "@/components/products/ModalBatchImport": { ModalBatchImport: () => null },
    "semantic-ui-react": { Icon: Box }, "./styles": { BatchImportIcon: Box },
  });
  renderToStaticMarkup(React.createElement(BatchImport, { disabled: true, importSettings: {} }));
  assert.equal(button.disabled, true);
  assert.equal(button.onClick, undefined);
  assert.equal(button.loading, false);
});

test("ProductsPage binds a remote page and keeps draft controls passive", (t) => {
  const a = createAdapter(t);
  let table, dropdown, form;
  const Page = load("src/components/products/ProductsPage/index.jsx", {
    "@/User": { useUserContext: () => ({ role: "viewer" }) }, "@/api/products": a.api,
    "@/common/components/buttons": { IconedButton: Box }, "@/common/components/custom": { Flex: Box },
    "@/common/components/custom/PrintBarCodes": { default: React.forwardRef(() => null) },
    "@/common/components/form": { TextControlled: Box, DropdownControlled: (props) => { dropdown = props; return null; } },
    "@/common/components/modals": { ModalAction: () => null, ModalMultiDelete: () => null },
    "@/common/components/table": { Filters: Box, Table: (props) => { table = props; return null; } },
    "@/common/constants": constants, "@/common/utils/pluralization": { formatCount() {}, pluralize() {} },
    "@/components/layout": { OnlyPrint: () => null, useListPageSideActions() {} },
    "@/roles": { RULES: { canRemoveProduct: {} } }, "../products.constants": productConstants,
    "react-hook-form": { FormProvider: Box }, "react-to-print": { useReactToPrint() {} },
    "semantic-ui-react": { Form: (props) => { form = props; return React.createElement(Box, props); } },
  }).default;
  const products = [{ id: "VABB001" }];
  const submit = () => {};
  const element = React.createElement(Page, { products, total: 1200, list: {
    appliedFilters: {}, methods: {}, onSubmit: submit, hydrated: false, pageNumber: 2, pageSize: 100,
  } });
  renderToStaticMarkup(React.createElement(QueryClientProvider, { client: a.client }, element));
  assert.equal(table.elements, products);
  assert.equal(table.onFilter, undefined);
  assert.equal(table.serverPagination.pageNumber, 2);
  assert.equal(table.serverPagination.pageSize, 100);
  assert.equal(table.serverPagination.sortFields.stock, undefined);
  assert.equal(table.serverPagination.sortFields.price, undefined);
  assert.equal(form.onSubmit, submit);
  assert.equal(dropdown.afterChange, undefined);
  assert.equal(dropdown.clearable, true);
  assert.ok(Object.values(productConstants.EMPTY_FILTERS).every((value) => value === ""));
});

test("stock changes invalidate supplier cache even after a partially successful batch", async (t) => {
  const a = createAdapter(t, 1);
  const va = a.catalogs.productCatalogKeys.supplier("VA");
  const xx = a.catalogs.productCatalogKeys.supplier("XX");
  let posts = 0;
  const stock = load("src/api/stock.js", {
    "@/common/constants": constants, "@/fetchUrls": { PATHS: { STOCK_FLOWS: "stockFlows" }, ADD: "add" },
    "@/components/products/products.constants": productConstants, "@/components/budgets/budgets.constants": {},
    "@/components/suppliers/suppliers.constants": {}, "./productCatalogs": a.catalogs,
    "./common": { ...a.common, useInvalidateQueries: () => () => {} },
    "./axios": { getInstance: () => ({ post: async () => ({ data: { statusOk: ++posts === 1 } }) }) },
  });
  for (const [name, value] of [
    ["useCreateStockFlow", { product: { id: "VABB001" }, quantity: 1 }],
    ["useConsumeStock", { budgetId: "B", flows: [{ productId: "VABB001" }] }],
    ["useAddSupplierStock", { supplierId: "VA", flows: Array.from({ length: 251 }, () => ({ productId: "VABB001" })) }],
  ]) {
    a.client.setQueryData(va, []); a.client.setQueryData(xx, []);
    await a.hook(stock[name])(value);
    assert.equal(a.client.getQueryState(va).isInvalidated, true, name);
    assert.equal(a.client.getQueryState(xx).isInvalidated, false, name);
  }
  assert.equal(posts, 2);
  assert.equal(a.calls.length, 0);
});

test("Brand/Supplier initial render never starts a product catalog for association", (t) => {
  const a = createAdapter(t);
  const noop = () => {};
  const mutation = () => async () => ({ statusOk: true });
  const componentStubs = {
    "@/User": { useUserContext: () => ({ role: "admin" }) },
    "@/api/products": { useDeleteBySupplierId: mutation }, "@/api/productCatalogs": a.catalogs,
    "@/api/brands": { useDeleteBrand: mutation, useEditBrand: mutation, useSetBrandState: mutation },
    "@/api/suppliers": { useDeleteSupplier: mutation, useEditSupplier: mutation, useSetSupplierState: mutation },
    "@/common/constants": { ...constants, PLACEHOLDERS: {}, PAGES: { BRANDS: {}, SUPPLIERS: {} } },
    "@/common/components/custom": { FieldsContainer: Box, FormField: Box, Message: Box, MessageHeader: Box },
    "@/common/components/form": { TextField: Box }, "@/common/components/modals": { ModalAction: () => null },
    "@/common/components/modals/ModalAction": { default: () => null },
    "@/common/components/modals/ModalUnsavedChanges": { default: () => null },
    "@/common/components/custom/PrintBarCodes": { default: React.forwardRef(() => null) },
    "@/common/utils": { isItemInactive: () => false },
    "@/components/layout": { OnlyPrint: () => null, useBreadcrumContext: () => ({ setLabels: noop }),
      useNavActionsContext: () => ({ resetActions: noop, setActions: noop }) },
    "@/components/products/products.constants": productConstants, "@/components/products/products.utils": productUtils,
    "@/components/products/BatchImportStock": { BatchImportStock: Box },
    "@/components/brands/BrandForm": { default: React.forwardRef(() => null) },
    "@/components/suppliers/SupplierForm": { default: React.forwardRef(() => null) },
    "@/components/suppliers/suppliers.constants": {},
    "@/hooks": { useAllowUpdate: () => ({}), useProtectedAction: () => ({}), useUnsavedChanges: () => ({}) },
    "@/roles": { RULES: { canUpdate: {}, canRemove: {} } },
    "next/navigation": { useRouter: () => ({ push: noop, refresh: noop }) }, "react-to-print": { useReactToPrint: () => noop },
  };
  for (const [route, prop] of [["marcas", "brand"], ["proveedores", "supplier"]]) {
    const Page = load(`src/app/(private)/${route}/[id]/page.client.jsx`, componentStubs).default;
    for (const hasProducts of [true, false, undefined]) {
      const element = React.createElement(Page, { [prop]: { id: "VA", name: "Name", hasProducts } });
      renderToStaticMarkup(React.createElement(QueryClientProvider, { client: a.client }, element));
    }
  }
  assert.equal(a.calls.length, 0);
  assert.equal(a.client.getQueryCache().getAll().length, 0);
});
