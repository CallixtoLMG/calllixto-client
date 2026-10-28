const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const lodash = require("lodash");
const React = require("react");
const { renderToString } = require("react-dom/server");

function load(file, imports, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../..", file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {}, ...globals, require: name => {
    if (name === "lodash") return lodash;
    assert.ok(name in imports, `Unexpected import: ${name}`);
    return imports[name];
  } };
  vm.runInNewContext(source, context, { filename: file });
  return context.exports;
}
const plain = value => JSON.parse(JSON.stringify(value));
const defaults = { id: "", name: "", state: "ACTIVE" };
const pagination = load("src/api/listPagination.js", {
  "@/common/constants": { DEFAULT_PAGE_SIZE: 20, SORTING: {} },
});
const mapping = load("src/api/listFilters.js", {});

function storage(values = {}) {
  const data = new Map(Object.entries(values));
  const reads = [], writes = [];
  return { data, reads, writes, getItem: key => { reads.push(key); return data.get(key) ?? null; },
    setItem: (key, value) => { writes.push([key, value]); data.set(key, value); } };
}

function harness(saved, sessionSaved) {
  const localStorage = storage(saved ? { filters: JSON.stringify(saved) } : {});
  const sessionStorage = storage(sessionSaved ? { filters: JSON.stringify(sessionSaved) } : {});
  const states = [], refs = [], effects = [];
  let stateIndex, refIndex, effectIndex, dirty = true, controls;
  let draft = { ...defaults };
  const resets = [];
  const methods = { control: {},
    reset: values => { draft = { ...values }; resets.push(plain(values)); dirty = true; },
    handleSubmit: handler => () => handler(draft),
  };
  const hooks = {
    useState: initial => {
      const index = stateIndex++;
      if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial;
      return [states[index], next => {
        const value = typeof next === "function" ? next(states[index]) : next;
        if (!Object.is(value, states[index])) { states[index] = value; dirty = true; }
      }];
    },
    useRef: initial => refs[refIndex++] ??= { current: initial },
    useMemo: compute => compute(), useCallback: callback => callback,
    useEffect: (callback, dependencies) => {
      const index = effectIndex++, previous = effects[index];
      if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        effects[index] = { callback, dependencies, pending: true };
      }
    },
  };
  const params = load("src/hooks/useFilterParams.js", { react: hooks }, { window: { localStorage, sessionStorage } });
  const filters = load("src/hooks/useFilters.js", {
    react: hooks, "react-hook-form": { useForm: () => methods, useWatch: () => draft },
    "./useFilterParams": params, "@/api/listPagination": pagination, "@/api/listFilters": mapping,
    "@/common/constants": { ALL: "all" },
  });
  const renders = [];
  function render() {
    stateIndex = refIndex = effectIndex = 0; dirty = false;
    controls = filters.default({ key: "filters", defaultFilters: defaults, remoteEntity: "products" });
    renders.push({ enabled: controls.hydrated, ...plain(controls.listRequest) });
    return controls;
  }
  function settle() {
    let iterations = 0;
    do {
      assert.ok(iterations++ < 10, "Effects must settle");
      for (const effect of effects) if (effect.pending) { effect.pending = false; effect.callback(); }
      if (dirty) render();
    } while (dirty || effects.some(effect => effect.pending));
    return controls;
  }
  render();
  return { get controls() { return controls; }, localStorage, sessionStorage, renders, resets, settle,
    changeDraft: fields => { draft = { ...draft, ...fields }; render(); },
    submit: () => { controls.onSubmit(); render(); settle(); } };
}

test("real React SSR and initial client render both output 20 without reading browser storage", () => {
  function html(globals) {
    const hook = load("src/hooks/useFilterParams.js", { react: React }, globals).default;
    return renderToString(React.createElement(() => {
      const { filters, hydrated } = hook({ key: "filters", defaultParams: defaults });
      const { pageSize } = pagination.getListPageState(filters);
      return React.createElement("output", { "data-ready": hydrated }, pageSize);
    }));
  }
  const server = html({});
  const client = html({ window: { localStorage: { getItem: () => { throw new Error("Premature storage read"); } } } });
  assert.equal(server, '<output data-ready="false">20</output>');
  assert.equal(client, server);
});

test("saved 100/page/sort restore after mount atomically; no enabled request uses defaults", () => {
  const saved = { ...defaults, name: "Guardado", pageSize: 100, page: 3, sorting: { key: "name", direction: "descending" } };
  const h = harness(saved);
  assert.equal(h.controls.hydrated, false);
  assert.equal(h.controls.listRequest.pageSize, 20);
  assert.equal(h.localStorage.reads.length, 0);
  assert.equal(h.resets.length, 0);
  h.settle();
  assert.equal(h.controls.hydrated, true);
  assert.equal(h.controls.listRequest.pageSize, 100);
  assert.equal(h.controls.listRequest.pageNumber, 3);
  assert.deepEqual(plain(h.controls.listRequest.sorting), saved.sorting);
  assert.equal(h.controls.draftFilters.name, "Guardado");
  assert.equal(h.controls.appliedFilters.name, "Guardado");
  assert.equal(h.controls.filterApplication, 0, "Restoration is not a Buscar action");
  assert.ok(h.renders.filter(r => r.enabled).every(r => r.pageSize === 100 && r.pageNumber === 3));
  assert.equal(h.localStorage.reads.length, 1);
  assert.equal(h.sessionStorage.reads.length, 1);
  assert.deepEqual(h.localStorage.writes, []);
});

test("absent preference keeps default 20 and page 1 when requests become enabled", () => {
  const h = harness();
  assert.equal(h.controls.hydrated, false);
  h.settle();
  assert.equal(h.controls.hydrated, true);
  assert.equal(h.controls.listRequest.pageSize, 20);
  assert.equal(h.controls.listRequest.pageNumber, 1);
  assert.deepEqual(h.localStorage.writes, []);
});

test("session overrides keep existing precedence and manual changes still persist after restoration", () => {
  const h = harness({ ...defaults, pageSize: 50, page: 2 }, { pageSize: 100, page: 4 });
  h.settle();
  assert.equal(h.controls.listRequest.pageSize, 100);
  assert.equal(h.controls.listRequest.pageNumber, 4);
  h.controls.setFilters({ ...h.controls.filters, pageSize: 20, page: 1 });
  assert.equal(JSON.parse(h.localStorage.writes.at(-1)[1]).pageSize, 20);
});

test("restored draft can change without applying or losing saved pagination/sorting", () => {
  const h = harness({ ...defaults, name: "Aplicado", pageSize: 100, page: 2, sorting: { key: "id", direction: "ascending" } });
  h.settle();
  h.changeDraft({ name: "Pendiente" });
  assert.equal(h.controls.appliedFilters.name, "Aplicado");
  assert.equal(h.controls.draftFilters.name, "Pendiente");
  assert.equal(h.controls.listRequest.pageNumber, 2);
  assert.deepEqual(h.localStorage.writes, []);
  h.submit();
  assert.equal(h.controls.appliedFilters.name, "Pendiente");
  assert.equal(h.controls.listRequest.pageNumber, 1);
  assert.equal(h.controls.listRequest.pageSize, 100);
  assert.equal(h.controls.listRequest.sorting.direction, "ascending");
  assert.equal(h.controls.filterApplication, 1);
});
