const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const babel = require("@babel/core");

const root = path.join(__dirname, "..", "..");

const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

const loadRolesModule = () => {
  const sourcePath = path.join(root, "src", "roles.js");
  const source = fs.readFileSync(sourcePath, "utf8");
  const { code } = babel.transformSync(source, {
    filename: sourcePath,
    plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")],
  });

  const sandboxModule = { exports: {} };

  vm.runInNewContext(
    `(function (require, module, exports) { ${code} })`,
    { require, module: sandboxModule, exports: sandboxModule.exports }
  )(require, sandboxModule, sandboxModule.exports);

  return sandboxModule.exports;
};

test("meli is only included in product-specific CRUD permissions", () => {
  const { ROLES, RULES } = loadRolesModule();

  assert.equal(ROLES.MELI, "meli");

  ["canCreateProduct", "canUpdateProduct", "canRemoveProduct"].forEach((rule) => {
    assert.equal(RULES[rule][ROLES.MELI], true);
    assert.equal(RULES[rule][ROLES.ADMIN], true);
    assert.equal(RULES[rule][ROLES.SADMIN], true);
    assert.equal(RULES[rule][ROLES.CALLIXTO], true);
    assert.equal(RULES[rule][ROLES.USER], undefined);
  });

  ["canCreate", "canUpdate", "canRemove"].forEach((rule) => {
    assert.equal(RULES[rule][ROLES.MELI], undefined);
    assert.equal(RULES[rule][ROLES.ADMIN], true);
  });
});

test("product entry points use product-specific permissions", () => {
  const navigationSource = read("src", "common", "constants", "index.js");
  const productsListSource = read("src", "app", "(private)", "productos", "page.jsx");
  const createProductSource = read("src", "app", "(private)", "productos", "crear", "page.jsx");
  const productsTableSource = read("src", "components", "products", "ProductsPage", "index.jsx");
  const productDetailSource = read("src", "app", "(private)", "productos", "[id]", "page.client.jsx");

  assert.match(navigationSource, /const getProductChildren = \(role\)/);
  assert.match(navigationSource, /ROLES\.canCreateProduct\[role\]/);
  assert.match(productsListSource, /RULES\.canCreateProduct\[role\]/);
  assert.match(productsListSource, /condition: \(\) => RULES\.canCreateProduct\[role\]/);
  assert.match(createProductSource, /RULES\.canCreateProduct\[resolvedRole\]/);
  assert.match(createProductSource, /push\(PAGES\.NOT_FOUND\.BASE\)/);
  assert.match(productsTableSource, /RULES\.canRemoveProduct\[role\]/);
  assert.match(productDetailSource, /canUpdate: RULES\.canUpdateProduct\[role\]/);
  assert.match(productDetailSource, /RULES\.canRemoveProduct\[role\]/);
});
