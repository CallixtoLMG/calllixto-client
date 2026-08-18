const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const babel = require("@babel/core");
const React = require("react");
const { renderToString } = require("react-dom/server");

const loadPasswordRequirementsModule = () => {
  const sourcePath = path.join(__dirname, "..", "..", "src", "common", "components", "form", "PasswordRequirements.jsx");
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
    if (request === "styled-components") return require("styled-components");
    if (request === "@/common/constants") {
      return {
        COLORS: { GREEN: "green", RED: "red" },
        ICONS: { CHECK: "check", X: "x" },
      };
    }
    if (request === "../custom") {
      return {
        Flex: ({ children }) => React.createElement("div", null, children),
        FlexColumn: ({ children }) => React.createElement("div", null, children),
        Icon: ({ name, color }) => React.createElement("i", { "data-name": name, "data-color": color }),
      };
    }
    return require(request);
  };

  vm.runInNewContext(
    `(function (require, module, exports) { ${code} })`,
    { require: customRequire, module, exports: module.exports }
  )(customRequire, module, module.exports);

  return module.exports;
};

test("PasswordRequirements renders password match requirement with existing states", () => {
  const { PasswordRequirements, PASSWORD_MATCH_REQUIREMENT } = loadPasswordRequirementsModule();

  const html = renderToString(
    React.createElement(PasswordRequirements, {
      requirements: [],
      password: "ValidPass1!",
      additionalRequirements: [PASSWORD_MATCH_REQUIREMENT],
      context: { confirmPassword: "ValidPass1!" },
    })
  );

  assert.match(html, /Las contraseñas coinciden\./);
  assert.match(html, /data-name="check"/);
  assert.match(html, /data-color="green"/);
});

test("password match requirement fails when fields are empty, partial, or different", () => {
  const {
    PASSWORD_MATCH_REQUIREMENT,
    getRequirementPassed,
    isPasswordConfirmationValid,
  } = loadPasswordRequirementsModule();

  const cases = [
    ["", ""],
    ["ValidPass1!", ""],
    ["", "ValidPass1!"],
    ["ValidPass1!", "OtherPass1!"],
  ];

  for (const [password, confirmPassword] of cases) {
    assert.equal(isPasswordConfirmationValid(password, confirmPassword), false);
    assert.equal(
      getRequirementPassed(PASSWORD_MATCH_REQUIREMENT, password, { confirmPassword }),
      false
    );
  }
});

test("password match requirement passes only when both values are equal and non-empty", () => {
  const {
    PASSWORD_MATCH_REQUIREMENT,
    getRequirementPassed,
    isPasswordConfirmationValid,
  } = loadPasswordRequirementsModule();

  assert.equal(isPasswordConfirmationValid("ValidPass1!", "ValidPass1!"), true);
  assert.equal(
    getRequirementPassed(PASSWORD_MATCH_REQUIREMENT, "ValidPass1!", { confirmPassword: "ValidPass1!" }),
    true
  );
});
