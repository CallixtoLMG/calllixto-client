const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const babel = require("@babel/core");
const React = require("react");
const { renderToString } = require("react-dom/server");

const loadUserModule = () => {
  const sourcePath = path.join(__dirname, "..", "..", "src", "User.js");
  const source = fs.readFileSync(sourcePath, "utf8");
  const { code } = babel.transformSync(source, {
    filename: sourcePath,
    presets: [[require.resolve("@babel/preset-react"), { runtime: "automatic" }]],
    plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")],
  });

  const module = { exports: {} };
  const customRequire = (request) => {
    if (request === "react") return React;
    if (request === "react/jsx-runtime") return require("react/jsx-runtime");
    if (request === "./api/userData") return { getUserData: async () => null };
    if (request === "./services/session") return { setUserData: () => {} };
    return require(request);
  };

  vm.runInNewContext(
    `(function (require, module, exports) { ${code} })`,
    { require: customRequire, module, exports: module.exports }
  )(customRequire, module, module.exports);

  return module.exports;
};

test("useUserContext throws when rendered outside UserProvider", () => {
  const { useUserContext } = loadUserModule();

  const ConsumerWithoutProvider = () => {
    useUserContext();
    return React.createElement("div");
  };

  assert.throws(
    () => renderToString(React.createElement(ConsumerWithoutProvider)),
    /useUserContext must be used within a UserProvider/
  );
});

test("UserProvider exposes the expected initial context shape", () => {
  const { UserProvider, useUserContext } = loadUserModule();

  const Consumer = () => {
    const context = useUserContext();

    assert.equal(Object.keys(context.userData).length, 0);
    assert.equal(context.role, "user");
    assert.equal(typeof context.setUserData, "function");

    return React.createElement("div");
  };

  renderToString(
    React.createElement(UserProvider, null, React.createElement(Consumer))
  );
});
