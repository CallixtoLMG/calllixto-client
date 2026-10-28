const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function pageHarness(kind, flag, options = {}) {
  const states = [], refs = [], effects = [], deletes = [];
  const downloads = [], errors = [], printJobs = [], notices = [];
  let stateIndex, refIndex, actions, tree, productRequests = 0;
  const entity = { id: kind === "brand" ? "CG" : "01", name: "Entidad", state: "ACTIVE", hasProducts: flag };
  if (flag === undefined) delete entity.hasProducts;
  const noop = () => {};
  const toast = Object.assign(message => notices.push(message), { success: noop, error: message => errors.push(message) });
  const jsx = (type, props) => ({ type, props });
  const edit = () => noop;
  const useDelete = () => id => { deletes.push(id); };
  const imports = {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: {
      useState: initial => { const index = stateIndex++; if (!(index in states)) states[index] = initial;
        return [states[index], next => { states[index] = typeof next === "function" ? next(states[index]) : next; }]; },
      useRef: initial => refs[refIndex++] ??= { current: initial },
      useMemo: compute => compute(), useCallback: callback => callback, useEffect: callback => effects.push(callback),
    },
    "@/User": { useUserContext: () => ({ role: "admin" }) },
    "@/api/brands": { useDeleteBrand: useDelete, useEditBrand: edit, useSetBrandState: edit },
    "@/api/suppliers": { useDeleteSupplier: useDelete, useEditSupplier: edit, useSetSupplierState: edit },
    "@/api/products": {
      useProductCatalog: () => { throw new Error("Deletion must not mount product catalog"); },
      useDeleteBySupplierId: edit,
      useProductsBySupplierId: (_id, queryOptions) => {
        assert.equal(_id, entity.id);
        assert.equal(queryOptions.enabled, false, "Supplier tools remain opt-in");
        return { data: [{ id: "01CG0001" }], isFetching: false, isError: false,
          loadProducts: async () => { productRequests++; return options.loadProducts ? options.loadProducts() : [{ id: "01CG0001" }]; }, invalidateProducts: noop };
      },
    },
    "@/common/components/custom": Object.fromEntries(["FieldsContainer", "FormField", "Message", "MessageHeader", "Icon"].map(name => [name, name])),
    "@/common/components/custom/PrintBarCodes": { default: "PrintBarCodes" },
    "@/common/components/form": { TextField: "TextField" },
    "@/common/components/modals": { ModalAction: "ModalAction" },
    "@/common/components/modals/ModalAction": { default: "ModalAction" },
    "@/common/components/modals/ModalUnsavedChanges": { default: "UnsavedChangesModal" },
    "@/common/constants": { ACTIVE: "ACTIVE", DELETE: "delete", INACTIVE: "INACTIVE", COLORS: {}, ICONS: {}, PLACEHOLDERS: {}, POPUP_POSITIONS: {},
      PAGES: { BRANDS: { NAME: "Marcas", BASE: "/marcas" }, SUPPLIERS: { NAME: "Proveedores", BASE: "/proveedores" } } },
    "@/common/utils": { isItemInactive: state => state === "INACTIVE", downloadExcel: (...args) => downloads.push(args) },
    "@/components/brands/BrandForm": { default: "BrandForm" },
    "@/components/suppliers/SupplierForm": { default: "SupplierForm" },
    "@/components/layout": { Loader: "Loader", OnlyPrint: "OnlyPrint",
      useBreadcrumContext: () => ({ setLabels: noop }), useNavActionsContext: () => ({ resetActions: noop, setActions: next => { actions = next; } }) },
    "@/components/products/BatchImportStock": { BatchImportStock: "BatchImportStock" },
    "@/components/products/products.constants": { PRODUCT_STATES: {}, UPLOAD_STOCK: "uploadStock", DISCOUNT_STOCK: "discountStock" },
    "@/components/products/products.utils": { getFormatedMargin: noop },
    "@/components/suppliers/suppliers.constants": {},
    "@/hooks": { useAllowUpdate: () => ({ isUpdating: false, setIsUpdating: noop }), useUnsavedChanges: () => ({}),
      useProtectedAction: () => ({ handleProtectedAction: callback => callback() }) },
    "@/roles": { RULES: { canUpdate: { admin: true }, canRemove: { admin: true } } },
    "@tanstack/react-query": { useMutation: options => ({ mutate: (...args) => options.mutationFn(...args), isPending: false }) },
    "next/navigation": { useRouter: () => ({ push: noop, refresh: noop }) },
    "react-hot-toast": { toast }, "react-to-print": { useReactToPrint: config => () => { printJobs.push(config.onBeforeGetContent()); } },
  };
  const file = `src/app/(private)/${kind === "brand" ? "marcas" : "proveedores"}/[id]/page.client.jsx`;
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../..", file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const context = { exports: {}, require: name => { assert.ok(name in imports, `Unexpected import ${name}`); return imports[name]; } };
  vm.runInNewContext(source, context, { filename: file });
  function nodes(node, result = []) {
    if (Array.isArray(node)) node.forEach(child => nodes(child, result));
    else if (node && typeof node === "object") { result.push(node); nodes(node.props?.children, result); }
    return result;
  }
  const render = () => {
    stateIndex = refIndex = 0; effects.length = 0;
    tree = context.exports.default({ [kind]: entity });
    effects.forEach(callback => callback());
  };
  render();
  return { entity, deletes, downloads, errors, printJobs, notices, render, get productRequests() { return productRequests; }, get actions() { return actions; },
    get printProducts() { return nodes(tree).find(node => node.type === "PrintBarCodes")?.props.products; },
    get tools() { return actions.find(action => action.text === "Stock/Excel").items; },
    get remove() { return actions.find(action => action.text === `Eliminar ${kind === "brand" ? "marca" : "proveedor"}`); },
    get modal() { return nodes(tree).find(node => node.type === "ModalAction").props; },
    get missingNotice() { return nodes(tree).some(node => node.type === "MessageHeader" && node.props.children === "Información de productos asociados no disponible"); } };
}

for (const kind of ["brand", "supplier"]) {
  test(`${kind}: hasProducts=true disables deletion with association message, zero products`, () => {
    const h = pageHarness(kind, true);
    assert.equal(h.remove.disabled, true);
    assert.match(h.remove.tooltip, /existen productos asociados/);
    h.remove.onClick(); h.render();
    assert.equal(Boolean(h.modal.showModal), false);
    assert.equal(h.deletes.length, 0);
    assert.equal(h.productRequests, 0);
    assert.equal(h.missingNotice, false);
  });

  test(`${kind}: hasProducts=false permits existing confirmation/DELETE without consulting products`, async () => {
    const h = pageHarness(kind, false);
    assert.equal(h.remove.disabled, false);
    assert.equal(h.productRequests, 0);
    h.remove.onClick(); h.render();
    assert.equal(h.modal.showModal, true);
    assert.equal(h.modal.disableButtons, false);
    assert.equal(h.modal.confirmationWord, "eliminar");
    await h.modal.onConfirm();
    assert.deepEqual(h.deletes, [h.entity.id]);
    assert.equal(h.productRequests, 0);
  });

  test(`${kind}: absent/null/nonboolean flag blocks locally with visible notice, never falls back`, () => {
    for (const flag of [undefined, null, "false", 0]) {
      const h = pageHarness(kind, flag);
      assert.equal(h.remove.disabled, true);
      assert.match(h.remove.tooltip, /no disponible/);
      assert.equal(h.missingNotice, true);
      h.remove.onClick(); h.render();
      assert.equal(Boolean(h.modal.showModal), false);
      assert.equal(h.productRequests, 0);
      assert.equal(h.deletes.length, 0);
    }
  });

  test(`${kind}: flag change while modal is open also guards confirmation`, async () => {
    for (const flag of [true, undefined, null]) {
      const h = pageHarness(kind, false);
      h.remove.onClick(); h.render();
      h.entity.hasProducts = flag; h.render();
      assert.equal(h.modal.disableButtons, true);
      await h.modal.onConfirm();
      assert.equal(h.deletes.length, 0);
      assert.equal(h.productRequests, 0);
    }
  });
}

test("supplier independent actions remain available regardless of backend hasProducts", () => {
  const h = pageHarness("supplier", true);
  const summarize = () => JSON.stringify([
    h.actions.find(action => action.text === "Desactivar proveedor"),
    h.actions.find(action => action.text === "Stock/Excel"),
    h.tools.find(tool => tool.id === "stock-template"),
  ].map(({ id, text, disabled, loading }) => ({ id, text, disabled, loading })));
  const before = summarize();
  h.entity.hasProducts = false; h.render();
  assert.equal(summarize(), before);
  h.entity.hasProducts = undefined; h.render();
  assert.equal(summarize(), before);
});

test("supplier false/invalid hasProducts disables all five product tools, never loads or starts action", async () => {
  for (const flag of [false, undefined, null, "false", "true", 0, 1]) {
    const h = pageHarness("supplier", flag);
    const actions = [
      h.actions.find(action => action.text === "Imprimir códigos de productos"),
      h.tools.find(tool => tool.id === "download-products"),
      h.actions.find(action => action.text === "Eliminar todos los productos del proveedor"),
      ...h.tools.filter(tool => ["upload-stock", "discount-stock"].includes(tool.id)),
    ];
    assert.equal(h.productRequests, 0);
    for (const action of actions) {
      assert.equal(action.disabled, true, `${action.text} must be disabled for ${flag}`);
      if (action.button) {
        assert.equal(action.button.props.disabled, true, "Custom stock button receives real disabled prop");
        await action.button.props.loadProducts();
      } else await action.onClick();
    }
    h.render();
    assert.equal(h.productRequests, 0, "Even direct invocation must not request products");
    assert.equal(h.downloads.length, 0);
    assert.equal(h.printJobs.length, 0);
    assert.equal(Boolean(h.modal.showModal), false);
    assert.deepEqual(h.errors, []);
    assert.deepEqual(h.notices, []);
    assert.equal(h.actions.some(action => action.loading), false);
    assert.equal(h.remove.disabled, flag !== false, "Supplier DELETE uses inverse rule");
  }
});

test("supplier true enables all five product tools, without eager requests; lazy load uses supplier ID", async () => {
  const h = pageHarness("supplier", true);
  assert.equal(h.actions.find(action => action.text === "Imprimir códigos de productos").disabled, false);
  assert.equal(h.actions.find(action => action.text === "Eliminar todos los productos del proveedor").disabled, false);
  for (const tool of h.tools.filter(tool => tool.id !== "stock-template")) {
    assert.equal(tool.disabled, false);
    if (tool.button) assert.equal(tool.button.props.disabled, false);
  }
  assert.equal(h.remove.disabled, true);
  assert.equal(h.productRequests, 0);
  await h.tools.find(tool => tool.id === "download-products").onClick();
  assert.equal(h.productRequests, 1);
  assert.equal(h.downloads.length, 1);
});

test("supplier tools open directly; mount/template/state change never load products", () => {
  const h = pageHarness("supplier", false);
  assert.equal(h.actions.some(action => action.text === "Cargar productos del proveedor"), false);
  assert.equal(h.productRequests, 0);
  h.tools.find(tool => tool.id === "stock-template").onClick();
  h.actions.find(action => action.text === "Desactivar proveedor").onClick();
  assert.equal(h.downloads.length, 1);
  assert.equal(h.productRequests, 0);
});

test("supplier Excel waits for complete data; duplicate clicks blocked with loading", async () => {
  let resolve;
  const products = Array.from({ length: 1200 }, (_, index) => ({ id: `VACG${index}`, name: `Product ${index}` }));
  const h = pageHarness("supplier", true, { loadProducts: () => new Promise(done => { resolve = done; }) });
  const download = h.tools.find(tool => tool.id === "download-products");
  const first = download.onClick();
  await download.onClick();
  h.render();
  assert.equal(h.productRequests, 1);
  assert.equal(h.downloads.length, 0);
  assert.equal(h.tools.find(tool => tool.id === "download-products").loading, true);
  resolve(products); await first; h.render();
  assert.equal(h.downloads.length, 1);
  assert.equal(h.downloads[0][0].length, 1201);
  assert.equal(h.downloads[0][0][1200][0], "VACG1199");
});

test("supplier failed tool shows error, never executes, and permits retry", async () => {
  let fail = true;
  const h = pageHarness("supplier", true, { loadProducts: async () => {
    if (fail) throw new Error("page 2 failed");
    return [{ id: "VACG1" }];
  } });
  await h.tools.find(tool => tool.id === "download-products").onClick(); h.render();
  assert.equal(h.downloads.length, 0);
  assert.deepEqual(h.errors, ["page 2 failed"]);
  assert.equal(h.tools.find(tool => tool.id === "download-products").loading, false);
  fail = false;
  await h.tools.find(tool => tool.id === "download-products").onClick();
  assert.equal(h.downloads.length, 1);
});

test("supplier stock actions defer both loads until preparation, then return complete dataset", async () => {
  const products = [{ id: "VACG1" }];
  const h = pageHarness("supplier", true, { loadProducts: async () => products });
  assert.equal(h.productRequests, 0);
  for (const id of ["upload-stock", "discount-stock"]) {
    const tool = h.tools.find(tool => tool.id === id);
    assert.equal(typeof tool.button.props.loadProducts, "function");
    assert.equal(await tool.button.props.loadProducts(), products);
  }
  assert.equal(h.productRequests, 2);
});

test("supplier batch deletion prepares accurate count; entity deletion remains independent", async () => {
  const h = pageHarness("supplier", true, { loadProducts: async () => Array.from({ length: 1200 }, (_, i) => ({ id: `VA${i}` })) });
  await h.actions.find(action => action.text === "Eliminar todos los productos del proveedor").onClick();
  h.render();
  assert.equal(h.productRequests, 1);
  assert.equal(h.modal.showModal, true);
  assert.match(JSON.stringify(h.modal.title), /1200/);
  assert.equal(h.remove.disabled, true);
  assert.equal(h.deletes.length, 0);
});

test("supplier printing commits newly loaded products before react-to-print reads content", async () => {
  const products = [{ id: "VACG1" }, { id: "VACG2" }];
  const h = pageHarness("supplier", true, { loadProducts: async () => products });
  await h.actions.find(action => action.text === "Imprimir códigos de productos").onClick();
  h.render();
  await h.printJobs[0];
  assert.deepEqual(Array.from(h.printProducts, p => p.id), ["VACG1", "VACG2"]);
});
