const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const { chromium } = require("@playwright/test");

const root = path.join(__dirname, "../..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const compile = (file) => ts.transpileModule(read(file), {
  fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const constants = {
  CONTENT_SIZES: { FIT: "fit-content" },
  DATE_FORMATS: { ISO: "YYYY-MM-DDTHH:mm:ss" }, ERROR_MESSAGES: { REQUIRED_FIELD_SHORT: "Campo requerido" },
  DEFAULT_PAGE_SIZE: 20, PAGE_SIZE_OPTIONS: [{ value: 20 }], SORTING: { ASC: "ascending", DESC: "descending" },
  ENTITIES: { BUDGET: "budget", BUDGETS: "budgets" }, ALL: "all", COLORS: {}, ICONS: {}, SHORTKEYS: {},
  PAGES: { BUDGETS: { NAME: "Ventas" } },
};
const load = (file, dependencies) => {
  const loaded = { exports: {} };
  vm.runInNewContext(compile(file), { module: loaded, exports: loaded.exports,
    require: (name) => dependencies[name] ?? require(name),
  });
  return loaded.exports;
};
const dates = load("src/common/utils/dates.js", { "@/common/constants": constants });
const range = load("src/components/budgets/salesDateRange.js", {
  "@/common/constants": constants, "@/common/utils/dates": dates,
  "@/common/utils/pluralization": { formatLastCount: (value, unit) => `${value} ${unit}` },
});

test("Sales dates keep PR5 UTC format; automatic range captures one instant and manual dates include both day boundaries", () => {
  const automatic = range.getAutomaticBudgetRange(12, new Date("2026-11-02T15:30:45Z"));
  assert.equal(automatic.startDate, "2025-11-02T15:30:45");
  assert.equal(automatic.endDate, "2026-11-02T15:30:45");
  const date = new Date(2026, 10, 2, 12);
  const start = range.parseBudgetDate(range.getManualBudgetDate(date, "startDate"));
  const end = range.parseBudgetDate(range.getManualBudgetDate(date, "endDate"));
  assert.equal(start.getHours(), 0);
  assert.equal(end.getHours(), 23);
  assert.equal(end.getMinutes(), 59);
  assert.equal(end.getSeconds(), 59);
  assert.equal(range.getManualBudgetDate(null, "startDate"), "");
  assert.equal(range.getBudgetDateRangeError(automatic), null);
  assert.equal(range.getBudgetDateRangeError({ startDate: automatic.endDate, endDate: automatic.endDate }), null);
  for (const invalid of [
    { ...automatic, startDate: "" }, { ...automatic, endDate: "" },
    { ...automatic, startDate: "2026-11-03T00:00:00" },
    { ...automatic, startDate: "2026-02-30T00:00:00" },
    { ...automatic, startDate: "not-a-date" },
  ]) assert.ok(range.getBudgetDateRangeError(invalid));
});

test("Sales retains existing presets and configured ranges, calculating dates when selected", () => {
  assert.deepEqual(Array.from(range.BASE_SALES_DATE_RANGES, ({ label }) => label), ["Hoy", "Esta semana", "Este mes", "Este año"]);
  const presets = range.buildSalesDateRanges([{ unit: "week", value: 2 }, { unit: "month", value: -1 }, { unit: "unknown", value: 1 }]);
  assert.equal(presets.length, 1);
  const selected = presets[0].getRange(new Date("2026-11-02T15:30:45Z"));
  assert.equal(selected.endDate, "2026-11-02T15:30:45");
  assert.equal(range.parseBudgetDate(selected.startDate).getDate(), 19);
});

test("Sales forms synchronize effective Settings once, preserve manual edits on irrelevant refetch and reset each group independently", async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ timezoneId: "America/Argentina/Buenos_Aires" });
  await page.clock.install({ time: new Date("2026-11-02T15:30:45Z") });
  await page.clock.setFixedTime(new Date("2026-11-02T15:30:45Z"));
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // A local component fixture: no Next server, authentication or backend requests.
  await page.route("http://sales.test/", (route) => route.fulfill({ contentType: "text/html", body: '<div id="root"></div>' }));
  await page.goto("http://sales.test/");
  for (const file of [
    path.join(path.dirname(require.resolve("react")), "umd/react.development.js"),
    path.join(path.dirname(require.resolve("react-dom")), "umd/react-dom.development.js"),
    path.join(path.dirname(require.resolve("react-hook-form")), "index.umd.js"),
    require.resolve("dayjs/dayjs.min.js"), require.resolve("dayjs/plugin/utc.js"), require.resolve("dayjs/plugin/timezone.js"),
  ]) await page.addScriptTag({ content: fs.readFileSync(file, "utf8") });
  const sources = Object.fromEntries([
    "src/common/utils/dates.js", "src/components/budgets/salesDateRange.js", "src/hooks/useServerListFilters.js",
    "src/api/budgets.js", "src/app/(private)/ventas/page.jsx", "src/components/budgets/SalesDateFilters.jsx",
  ].map((file) => [file, compile(file)]));
  await page.evaluate(({ sources, constants, filters }) => {
    const R = window.React, F = window.ReactHookForm, h = R.createElement;
    const dependencies = {
      react: R, "react-hook-form": F,
      "react/jsx-runtime": { jsx: (type, props, key) => h(type, { ...props, key }), jsxs: (type, props, key) => h(type, { ...props, key }), Fragment: R.Fragment },
      dayjs: window.dayjs, "dayjs/plugin/utc": window.dayjs_plugin_utc, "dayjs/plugin/timezone": window.dayjs_plugin_timezone,
      "@/common/constants": constants, "@/common/utils/pluralization": { formatLastCount: (value, unit) => `${value} ${unit}` },
      "@/components/budgets/budgets.constants": filters,
      "@/fetchUrls": { PATHS: { BUDGETS: "budgets" } }, "@tanstack/react-query": {}, "./axios": {}, "./common": {},
      "@/components/layout": { useBreadcrumContext: () => ({ setLabels() {} }) },
      "@/hooks": { useKeyboardShortcuts() {} }, "next/navigation": { useRouter: () => ({ push() {} }) },
      "react-hot-toast": { toast: { error() {} } },
    };
    const load = (file) => {
      const loaded = { exports: {} };
      new Function("module", "exports", "require", sources[file])(loaded, loaded.exports, (name) => {
        if (!(name in dependencies)) throw new Error(`Missing fixture dependency: ${name}`);
        return dependencies[name];
      });
      return loaded.exports;
    };
    dependencies["@/common/utils/dates"] = load("src/common/utils/dates.js");
    dependencies["@/components/budgets/salesDateRange"] = dependencies["./salesDateRange"] = load("src/components/budgets/salesDateRange.js");
    dependencies["@/hooks/useServerListFilters"] = load("src/hooks/useServerListFilters.js");
    window.applies = [];
    window.renders = [];
    const refresh = (state) => window.applies.push(state);
    dependencies["@/api/pagedLists"] = { useRefreshServerList: () => refresh };
    dependencies["./pagedLists"] = { usePagedList: ({ appliedFilters, pageNumber, pageSize, sort, order, hydrated }) => {
      window.request = { appliedFilters, pageNumber, pageSize, sort, order, hydrated };
      window.renders.push({ months: window.settings?.data?.defaultPageDateRange?.value, ...window.request });
      return { total: null };
    } };
    dependencies["@/api/budgets"] = load("src/api/budgets.js");
    window.settings = { data: {}, isSuccess: true, isPlaceholderData: true, isFetching: true };
    dependencies["@/api/settings"] = { useGetSetting: () => window.settings };
    dependencies["@/common/components/custom"] = {
      FormField: ({ control: Control, label, error, ...props }) => h("label", null, label, h(Control, { ...props, ariaLabel: label }), error && h("span", { role: "alert" }, error.content)),
    };
    dependencies["@/common/components/form"] = {
      DatePicker: ({ selected, onChange, disabled, ariaLabel }) => h("input", { type: "date", disabled, "aria-label": ariaLabel,
        value: selected ? `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}-${String(selected.getDate()).padStart(2, "0")}` : "",
        onChange: (event) => onChange(event.target.value ? new Date(`${event.target.value}T00:00:00`) : null),
      }),
      DropdownControlled: ({ name, options, afterChange }) => h(F.Controller, { name, render: ({ field }) => h("select", {
        "aria-label": "Rangos predefinidos", value: field.value || "", onChange: (event) => { field.onChange(event.target.value); afterChange(event.target.value); },
      }, h("option", { value: "" }, "Seleccione"), ...options.map(({ text, value }) => h("option", { key: value, value }, text))) }),
    };
    dependencies["@/common/components/form/DatePicker/DatePicker"] = {
      DatePicker: dependencies["@/common/components/form"].DatePicker,
    };
    const DateFilters = load("src/components/budgets/SalesDateFilters.jsx").default;
    dependencies["@/components/budgets/ServerBudgetsPage"] = { __esModule: true, default: ({ list, datePresets }) => {
      window.list = list;
      return h(F.FormProvider, list.methods, h("form", { onSubmit: list.onSubmit },
        h(DateFilters, { presets: datePresets, disabled: !list.hydrated }),
        ...["id", "customer", "createdBy", "state", "paymentStatus"].map((name) => h("input", { key: name, "aria-label": name, ...list.methods.register(name) })),
        h("button", { type: "submit" }, "Buscar"),
        h("button", { type: "button", onClick: list.onRestoreDates }, "Reset fechas"),
        h("button", { type: "button", onClick: list.onRestoreFilters }, "Reset filtros")));
    } };
    localStorage.setItem("budgetsFilters", JSON.stringify({ startDate: "2020-01-01T00:00:00", endDate: "2020-02-01T00:00:00", page: 7, createdBy: "Ana" }));
    const Route = load("src/app/(private)/ventas/page.jsx").default;
    const root = window.ReactDOM.createRoot(document.getElementById("root"));
    window.renderSales = () => window.ReactDOM.flushSync(() => root.render(h(Route)));
    window.renderSales();
  }, { sources, constants, filters: {
    SALES_FILTERS: { id: "", customer: "", createdBy: "", state: "", paymentStatus: "", startDate: "", endDate: "" },
    BUDGET_SORT_FIELDS: { id: "id", date: "createdAt" }, BUDGETS_FILTERS_KEY: "budgetsFilters", DEFAULT_DATE_RANGE_VALUE: 3,
    BUDGET_STATES: { DRAFT: { id: "DRAFT" } },
  } });
  assert.equal(await page.evaluate(() => window.request.hydrated), false);
  await page.evaluate(() => { window.settings = { data: { defaultPageDateRange: { value: 12 }, historyDateRanges: [{ unit: "week", value: 2 }] }, isSuccess: true, isFetching: true }; window.renderSales(); });
  assert.equal(await page.evaluate(() => window.request.hydrated), false);
  await page.evaluate(() => { window.settings = { ...window.settings, isFetching: false }; window.renderSales(); });
  await page.waitForFunction(() => window.request.hydrated);
  const initial = await page.evaluate(() => window.request);
  assert.equal(initial.appliedFilters.startDate, "2025-11-02T15:30:45");
  assert.equal(initial.appliedFilters.endDate, "2026-11-02T15:30:45");
  assert.equal(initial.appliedFilters.createdBy, "Ana");
  assert.equal(initial.pageNumber, 1);
  assert.equal(await page.evaluate(() => window.applies.length), 1, "initial range must recount even if its query was cached");
  await page.getByLabel("Desde", { exact: true }).fill("2024-01-02");
  await page.getByLabel("Hasta", { exact: true }).fill("2024-02-03");
  const commercial = { id: "V42", customer: "Cliente Uno", createdBy: "Vendedor Uno", state: "CONFIRMED", paymentStatus: "PENDING" };
  for (const [name, value] of Object.entries(commercial)) await page.getByLabel(name, { exact: true }).fill(value);
  assert.deepEqual(await page.evaluate(() => window.request), initial, "draft must not change query identity");
  await page.getByRole("button", { name: "Buscar" }).click();
  await page.waitForFunction(() => window.applies.length === 2);
  const manual = await page.evaluate(() => window.request);
  assert.equal(manual.appliedFilters.startDate, "2024-01-02T03:00:00");
  assert.equal(manual.appliedFilters.endDate, "2024-02-04T02:59:59");
  assert.equal(manual.appliedFilters.customerName, commercial.customer);
  assert.equal(manual.appliedFilters.paymentStatus, "PENDING");
  await page.evaluate(() => window.list.setPageNumber(2));
  await page.waitForFunction(() => window.request.pageNumber === 2);
  await page.evaluate(() => window.list.setSorting("date", "descending"));
  await page.waitForFunction(() => window.request.sort === "createdAt");
  assert.deepEqual(await page.evaluate(() => window.request.appliedFilters), manual.appliedFilters);
  assert.equal(await page.evaluate(() => window.request.pageNumber), 1);
  for (const [label, value] of [["Desde", ""], ["Hasta", ""], ["Desde", "2025-01-01"]]) {
    await page.getByLabel("Desde", { exact: true }).fill("2024-01-02");
    await page.getByLabel("Hasta", { exact: true }).fill("2024-02-03");
    await page.getByLabel(label, { exact: true }).fill(value);
    await page.getByRole("button", { name: "Buscar" }).click();
    await page.getByRole("alert").first().waitFor();
    assert.equal(await page.evaluate(() => window.applies.length), 2);
  }
  // An irrelevant refetch must preserve both manual draft and applied dates.
  await page.getByLabel("Desde", { exact: true }).fill("2023-01-02");
  await page.evaluate(() => { window.settings = { ...window.settings, isFetching: true }; window.renderSales(); });
  await page.evaluate(() => { window.settings = { ...window.settings, isFetching: false, data: { ...window.settings.data } }; window.renderSales(); });
  assert.equal(await page.getByLabel("Desde", { exact: true }).inputValue(), "2023-01-02");
  assert.equal(await page.evaluate(() => window.applies.length), 2);
  assert.equal(await page.evaluate(() => window.request.appliedFilters.startDate), manual.appliedFilters.startDate);
  // A real effective Setting change synchronizes once and never enables the old range.
  await page.evaluate(() => { window.renders = []; window.settings = { ...window.settings, data: { ...window.settings.data, defaultPageDateRange: { value: 3 } } }; window.renderSales(); });
  await page.waitForFunction(() => window.applies.length === 3);
  assert.equal(await page.getByLabel("Desde", { exact: true }).inputValue(), "2026-08-02");
  assert.equal(await page.evaluate(() => window.request.appliedFilters.startDate), "2026-08-02T15:30:45");
  assert.equal(await page.evaluate(() => window.renders.some((entry) => entry.months === 3 && entry.hydrated && entry.appliedFilters.startDate !== "2026-08-02T15:30:45")), false);
  await page.clock.setFixedTime(new Date("2026-11-03T16:00:00Z"));
  await page.getByLabel("customer", { exact: true }).fill("Draft conservado");
  await page.getByRole("button", { name: "Reset fechas", exact: true }).click();
  await page.waitForFunction(() => window.applies.length === 4);
  assert.equal(await page.evaluate(() => window.request.appliedFilters.startDate), "2026-08-03T16:00:00");
  assert.equal(await page.evaluate(() => window.request.appliedFilters.endDate), "2026-11-03T16:00:00");
  assert.equal(await page.evaluate(() => window.request.pageNumber), 1);
  for (const [name, value] of Object.entries(commercial)) assert.equal(await page.getByLabel(name, { exact: true }).inputValue(), name === "customer" ? "Draft conservado" : value);
  assert.equal(await page.evaluate(() => window.request.appliedFilters.customerName), commercial.customer);
  assert.equal(await page.evaluate(() => window.request.appliedFilters.paymentStatus), commercial.paymentStatus);
  await page.getByLabel("Rangos predefinidos").selectOption("custom_week_2");
  assert.equal(await page.evaluate(() => window.applies.length), 4);
  const presetDates = await page.evaluate(() => ({ startDate: window.list.methods.getValues("startDate"), endDate: window.list.methods.getValues("endDate") }));
  await page.getByLabel("customer", { exact: true }).fill("Draft cliente");
  await page.getByRole("button", { name: "Reset filtros", exact: true }).click();
  await page.waitForFunction(() => window.applies.length === 5);
  assert.equal(await page.getByLabel("Rangos predefinidos").inputValue(), "custom_week_2");
  assert.deepEqual(await page.evaluate(() => ({ startDate: window.list.methods.getValues("startDate"), endDate: window.list.methods.getValues("endDate") })), presetDates);
  assert.equal(await page.evaluate(() => window.request.appliedFilters.startDate), "2026-08-03T16:00:00");
  for (const name of Object.keys(commercial)) assert.equal(await page.getByLabel(name, { exact: true }).inputValue(), "");
  await page.getByLabel("Hasta", { exact: true }).press("Enter");
  await page.waitForFunction(() => window.applies.length === 6);
  assert.deepEqual(await page.evaluate(() => window.request.appliedFilters), presetDates);
  assert.equal(await page.evaluate(() => window.request.appliedFilters.endDate), "2026-11-03T16:00:00");
  assert.deepEqual(errors, []);
});

test("History has no runtime, navigation, keys or restore; only old URL redirect remains", async () => {
  const files = fs.readdirSync(path.join(root, "src"), { recursive: true }).filter((file) => /\.(js|jsx|ts|tsx)$/.test(file));
  for (const file of files) {
    assert.doesNotMatch(read(path.join("src", file)), /historial-ventas|useListBudgetsHistory|BUDGETS_HISTORY|budgetsHistoryFilters|budgets-history-date-range|listAllBudgets|downloadBudgetsExcel|BudgetsHistoryFilters|HistoryDateRanges/);
  }
  assert.equal(fs.existsSync(path.join(root, "src/app/(private)/historial-ventas/page.jsx")), false);
  const config = require(path.join(root, "next.config.js"));
  assert.ok((await config.redirects()).some(({ source, destination }) => source === "/historial-ventas" && destination === "/ventas"));
});
