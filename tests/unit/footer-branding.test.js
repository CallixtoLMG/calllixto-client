const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("private layout mounts footer without exposing it through public layout barrel", () => {
  const privateLayout = read("src", "app", "(private)", "layout.jsx");
  const publicLayout = read("src", "app", "(public)", "layout.jsx");
  const layoutIndex = read("src", "components", "layout", "index.jsx");

  assert.match(privateLayout, /import Footer from "@\/components\/layout\/Footer\/Index"/);
  assert.match(privateLayout, /<Footer \/>/);
  assert.doesNotMatch(publicLayout, /Footer/);
  assert.match(layoutIndex, /\/\/ export \{ default as Footer \} from "\.\/Footer"/);
});

test("footer uses CallixtoGLM branding through local unoptimized image", () => {
  const footer = read("src", "components", "layout", "Footer", "Index.jsx");

  assert.match(footer, /src="\/branding\/logo-callixtoglm\.png"/);
  assert.match(footer, /alt="CallixtoGLM"/);
  assert.match(footer, /unoptimized/);
  assert.doesNotMatch(footer, /\/accounts\/callixto\.png|Logo-Callixto3/);
});

test("header continues using Callixto app logo", () => {
  const header = read("src", "components", "layout", "Header", "index.jsx");

  assert.match(header, /src="\/branding\/logo-callixto\.png" alt="Callixto"/);
  assert.doesNotMatch(header, /logo-callixtoglm|alt="CallixtoGLM"/);
});
