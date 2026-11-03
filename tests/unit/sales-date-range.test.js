const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const { chromium, expect } = require("@playwright/test");

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
const pluralization = load("src/common/utils/pluralization.js", { "./numbers": load("src/common/utils/numbers.js", {}) });
const range = load("src/components/budgets/salesDateRange.js", {
  "@/common/constants": constants, "@/common/utils/dates": dates,
  "@/common/utils/pluralization": pluralization,
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

test("Sales describes manual ranges by inclusive calendar days and only uses complete weeks or months", () => {
  for (const [start, end, expected] of [
    [[10, 3], [10, 3], "1 día"], [[10, 3], [10, 23], "3 semanas"],
    [[10, 1], [10, 30], "1 mes"], [[10, 1], [11, 20], "50 días"],
  ]) {
    const startDate = range.getManualBudgetDate(new Date(2026, ...start), "startDate");
    const endDate = range.getManualBudgetDate(new Date(2026, ...end), "endDate");
    assert.equal(range.getAppliedSalesRangeLabel({ startDate, endDate }, []), expected);
  }
});

const openSalesFixture = async (t) => {
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
    require.resolve("styled-components/dist/styled-components.min.js"),
    require.resolve("dayjs/dayjs.min.js"), require.resolve("dayjs/plugin/utc.js"), require.resolve("dayjs/plugin/timezone.js"),
  ]) await page.addScriptTag({ content: fs.readFileSync(file, "utf8") });
  const sources = Object.fromEntries([
    "src/common/utils/dates.js", "src/components/budgets/salesDateRange.js", "src/hooks/useServerListFilters.js",
    "src/api/budgets.js", "src/app/(private)/ventas/page.jsx", "src/components/budgets/SalesDateFilters.jsx",
    "src/components/budgets/ServerBudgetsPage.jsx", "src/common/components/table/styles.jsx",
    "src/common/utils/pluralization.js", "src/common/utils/numbers.js",
  ].map((file) => [file, compile(file)]));
  await page.evaluate(({ sources, constants, filters }) => {
    const R = window.React, F = window.ReactHookForm, h = R.createElement;
    const dependencies = {
      react: R, "react-hook-form": F,
      "react/jsx-runtime": { jsx: (type, props, key) => h(type, { ...props, key }), jsxs: (type, props, key) => h(type, { ...props, key }), Fragment: R.Fragment },
      dayjs: window.dayjs, "dayjs/plugin/utc": window.dayjs_plugin_utc, "dayjs/plugin/timezone": window.dayjs_plugin_timezone,
      "@/common/constants": constants, "styled-components": window.styled,
      "@/components/budgets/budgets.constants": filters,
      "./budgets.constants": { ...filters, getBudgetColumns: () => [] },
      "@/fetchUrls": { PATHS: { BUDGETS: "budgets" } }, "@tanstack/react-query": {}, "./axios": {}, "./common": {},
      "@/components/layout": { useBreadcrumContext: () => ({ setLabels() {} }), useListPageSideActions() {} },
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
    dependencies["./numbers"] = load("src/common/utils/numbers.js");
    dependencies["@/common/utils/pluralization"] = load("src/common/utils/pluralization.js");
    dependencies["@/common/utils/dates"] = load("src/common/utils/dates.js");
    dependencies["@/components/budgets/salesDateRange"] = dependencies["./salesDateRange"] = load("src/components/budgets/salesDateRange.js");
    dependencies["@/hooks/useServerListFilters"] = load("src/hooks/useServerListFilters.js");
    window.applies = [];
    window.renders = [];
    const refresh = (state) => window.applies.push(state);
    dependencies["@/api/pagedLists"] = { useRefreshServerList: () => refresh };
    dependencies["./pagedLists"] = { usePagedList: ({ appliedFilters, pageNumber, pageSize, sort, order, hydrated }) => {
      window.request = { appliedFilters, pageNumber, pageSize, sort, order, hydrated };
      window.renders.push(window.request);
      return { total: null };
    } };
    dependencies["@/api/budgets"] = load("src/api/budgets.js");
    window.settings = { data: {}, isSuccess: true, isPlaceholderData: true, isFetching: true };
    dependencies["@/api/settings"] = { useGetSetting: () => window.settings };
    const Box = R.forwardRef(({ children, className, role, "aria-label": ariaLabel }, ref) => h("div", { className, role, "aria-label": ariaLabel, ref }, children));
    dependencies["@/common/components/custom"] = {
      Flex: window.styled.div`display: flex;`,
      Button: ({ children, ...props }) => h("button", { "aria-label": props["aria-label"], type: props.type, disabled: props.disabled, onClick: props.onClick }, children),
      Icon: () => "↶",
      FormField: ({ control: Control, label, error, ...props }) => h("label", { className: "field" }, label, h(Control, { ...props, ariaLabel: label }), error && h("span", { role: "alert" }, error.content)),
    };
    dependencies["@/common/components/form"] = {
      DatePicker: ({ selected, onChange, disabled, ariaLabel }) => h("input", { type: "date", disabled, "aria-label": ariaLabel,
        value: selected ? `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}-${String(selected.getDate()).padStart(2, "0")}` : "",
        onChange: (event) => onChange(event.target.value ? new Date(`${event.target.value}T00:00:00`) : null),
      }),
      TextControlled: ({ name }) => h(F.Controller, { name, render: ({ field }) => h("input", { ...field, "aria-label": name }) }),
      DropdownControlled: ({ name, label, options, afterChange }) => h(F.Controller, { name, render: ({ field }) => name !== "presetRange"
        ? h("input", { ...field, "aria-label": name })
        : h("label", { className: "field" }, label, h("select", {
          "aria-label": label, value: field.value || "", onChange: (event) => { field.onChange(event.target.value); afterChange(event.target.value); },
        }, h("option", { value: "" }, "Seleccione"), ...options.map(({ text, value }) => h("option", { key: value, value }, text)))) }),
    };
    dependencies["@/common/components/form/DatePicker/DatePicker"] = {
      DatePicker: dependencies["@/common/components/form"].DatePicker,
    };
    dependencies["semantic-ui-react"] = {
      Form: "form", Popup: ({ trigger }) => trigger, Pagination: Box, Segment: Box,
      Table: Object.assign(() => null, { Cell: Box, HeaderCell: Box, Header: Box, Row: Box }),
    };
    dependencies["@/common/components/table/styles"] = load("src/common/components/table/styles.jsx");
    dependencies["@/common/components/table"] = {
      Table: () => null,
      Filters: ({ children, onRestoreFilters }) => h("div", null, children,
        h("button", { type: "submit" }, "Buscar"),
        h("button", { type: "button", onClick: onRestoreFilters }, "Reset filtros")),
    };
    dependencies["./SalesDateFilters"] = load("src/components/budgets/SalesDateFilters.jsx");
    const ServerPage = load("src/components/budgets/ServerBudgetsPage.jsx").default;
    dependencies["@/components/budgets/ServerBudgetsPage"] = { __esModule: true, default: (props) => {
      window.list = props.list;
      return h(ServerPage, props);
    } };
    const Route = load("src/app/(private)/ventas/page.jsx").default;
    const root = window.ReactDOM.createRoot(document.getElementById("root"));
    let key = 0;
    window.renderSales = () => window.ReactDOM.flushSync(() => root.render(h(Route, { key })));
    window.remountSales = () => {
      key += 1;
      window.applies = [];
      window.renders = [];
      window.renderSales();
    };
    window.renderSales();
  }, { sources, constants, filters: {
    SALES_FILTERS: { id: "", customer: "", createdBy: "", state: "", paymentStatus: "", startDate: "", endDate: "", presetRange: "", defaultRangeMonths: "" },
    BUDGET_SORT_FIELDS: { id: "id", date: "createdAt" }, BUDGETS_FILTERS_KEY: "budgetsFilters", DEFAULT_DATE_RANGE_VALUE: 3,
    BUDGET_STATES: { DRAFT: { id: "DRAFT" }, CONFIRMED: { id: "CONFIRMED" } },
  } });
  await page.addStyleTag({ content: ".field { display: flex; flex-direction: column; min-width: 0; } .field > :is(input, select) { box-sizing: border-box; height: 40px; max-width: 100%; }" });
  return { page, errors };
};

const datesOf = ({ startDate, endDate }) => ({ startDate, endDate });
const savedFilters = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("budgetsFilters")));
const storedDates = async (page) => datesOf(await savedFilters(page));

test("Sales restores the applied range on re-entry and uses the latest account default only on date reset", async (t) => {
  const { page, errors } = await openSalesFixture(t);
  assert.equal(await page.evaluate(() => window.request.hydrated), false);
  await page.evaluate(() => { window.settings = { data: { defaultPageDateRange: { value: 12 }, historyDateRanges: [{ unit: "week", value: 2 }] }, isSuccess: true, isFetching: true }; window.renderSales(); });
  assert.equal(await page.evaluate(() => window.request.hydrated), false);
  await page.evaluate(() => { window.settings = { ...window.settings, isFetching: false }; window.renderSales(); });
  await page.waitForFunction(() => window.request.hydrated);
  const initial = await page.evaluate(() => window.request);
  assert.equal(initial.appliedFilters.startDate, "2025-11-02T15:30:45");
  assert.equal(initial.appliedFilters.endDate, "2026-11-02T15:30:45");
  assert.equal(initial.pageNumber, 1);
  assert.equal(await page.evaluate(() => window.applies.length), 1, "initial range must recount even if its query was cached");
  assert.deepEqual(await storedDates(page), datesOf(initial.appliedFilters));
  await page.getByLabel("Desde", { exact: true }).fill("2026-09-02");
  await page.getByLabel("Hasta", { exact: true }).fill("2026-11-01");
  const commercial = { id: "V42", customer: "Cliente Uno", createdBy: "Vendedor Uno", state: "CONFIRMED", paymentStatus: "PENDING" };
  for (const [name, value] of Object.entries(commercial)) await page.getByLabel(name, { exact: true }).fill(value);
  assert.deepEqual(await page.evaluate(() => window.request), initial, "draft must not change query identity");
  assert.deepEqual(await storedDates(page), datesOf(initial.appliedFilters));
  await page.getByRole("button", { name: "Buscar" }).click();
  await page.waitForFunction(() => window.applies.length === 2);
  const manual = await page.evaluate(() => window.request);
  assert.equal(manual.appliedFilters.startDate, "2026-09-02T03:00:00");
  assert.equal(manual.appliedFilters.endDate, "2026-11-02T02:59:59");
  assert.deepEqual(await storedDates(page), datesOf(manual.appliedFilters));
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
  await page.getByLabel("Rangos predefinidos").selectOption("base_month");
  assert.deepEqual(await storedDates(page), datesOf(manual.appliedFilters));
  assert.deepEqual(await page.evaluate(() => window.request.appliedFilters), manual.appliedFilters);
  await page.getByLabel("Desde", { exact: true }).fill("2023-01-02");
  await page.evaluate(() => window.remountSales());
  await page.waitForFunction(() => window.request.hydrated);
  assert.deepEqual(await page.evaluate(() => window.request.appliedFilters), manual.appliedFilters);
  assert.equal(await page.getByLabel("Desde", { exact: true }).inputValue(), "2026-09-02");
  assert.equal(await page.evaluate(() => window.request.sort), "createdAt");
  assert.deepEqual(await page.evaluate(() => window.applies.map(({ appliedFilters }) => appliedFilters.startDate)), [manual.appliedFilters.startDate]);
  assert.deepEqual(await storedDates(page), datesOf(manual.appliedFilters));

  await page.clock.setFixedTime(new Date("2026-11-03T16:00:00Z"));
  await page.getByRole("button", { name: "Restaurar fechas", exact: true }).click();
  await page.waitForFunction(() => window.applies.length === 2);
  const restored = { startDate: "2025-11-03T16:00:00", endDate: "2026-11-03T16:00:00" };
  assert.deepEqual(await storedDates(page), restored);
  await page.clock.setFixedTime(new Date("2026-11-04T16:00:00Z"));
  await page.evaluate(() => window.remountSales());
  await page.waitForFunction(() => window.request.hydrated);
  assert.deepEqual(datesOf(await page.evaluate(() => window.request.appliedFilters)), restored);

  // Both drafts and applied dates survive a change to the account default and presets.
  await page.getByLabel("Desde", { exact: true }).fill("2023-01-02");
  await page.evaluate(() => { window.settings = { ...window.settings, isFetching: true }; window.renderSales(); });
  await page.evaluate(() => {
    window.settings = { ...window.settings, isFetching: false,
      data: { defaultPageDateRange: { value: 3 }, historyDateRanges: [{ unit: "week", value: 3 }] } };
    window.renderSales();
  });
  assert.equal(await page.getByLabel("Desde", { exact: true }).inputValue(), "2023-01-02");
  assert.equal(await page.evaluate(() => window.applies.length), 1);
  assert.deepEqual(datesOf(await page.evaluate(() => window.request.appliedFilters)), restored);
  assert.deepEqual(await storedDates(page), restored);
  await expect(page.getByRole("status")).toHaveText("Rango aplicado: Últimos 12 meses");

  await page.getByLabel("customer", { exact: true }).fill("Draft conservado");
  await page.getByRole("button", { name: "Restaurar fechas", exact: true }).click();
  await page.waitForFunction(() => window.applies.length === 2);
  const newDefault = { startDate: "2026-08-04T16:00:00", endDate: "2026-11-04T16:00:00" };
  assert.deepEqual(datesOf(await page.evaluate(() => window.request.appliedFilters)), newDefault);
  assert.deepEqual(await storedDates(page), newDefault);
  await expect(page.getByRole("status")).toHaveText("Rango aplicado: Últimos 3 meses");
  assert.equal(await page.evaluate(() => window.request.pageNumber), 1);
  for (const [name, value] of Object.entries(commercial)) assert.equal(await page.getByLabel(name, { exact: true }).inputValue(), name === "customer" ? "Draft conservado" : value);
  assert.equal(await page.evaluate(() => window.request.appliedFilters.customerName), commercial.customer);
  assert.equal(await page.evaluate(() => window.request.appliedFilters.paymentStatus), commercial.paymentStatus);
  await page.getByLabel("Rangos predefinidos").selectOption("custom_week_3");
  assert.equal(await page.evaluate(() => window.applies.length), 2);
  assert.deepEqual(await storedDates(page), newDefault);
  const presetDates = await page.evaluate(() => ({ startDate: window.list.methods.getValues("startDate"), endDate: window.list.methods.getValues("endDate") }));
  await page.getByLabel("customer", { exact: true }).fill("Draft cliente");
  await page.getByRole("button", { name: "Reset filtros", exact: true }).click();
  await page.waitForFunction(() => window.applies.length === 3);
  assert.equal(await page.getByLabel("Rangos predefinidos").inputValue(), "custom_week_3");
  assert.deepEqual(await page.evaluate(() => ({ startDate: window.list.methods.getValues("startDate"), endDate: window.list.methods.getValues("endDate") })), presetDates);
  assert.deepEqual(datesOf(await page.evaluate(() => window.request.appliedFilters)), newDefault);
  assert.deepEqual(await storedDates(page), newDefault);
  assert.deepEqual(await page.evaluate((names) => window.list.methods.getValues(names), Object.keys(commercial)), ["", "", "", "", ""]);
  await page.getByLabel("Hasta", { exact: true }).press("Enter");
  await page.waitForFunction(() => window.applies.length === 4);
  assert.deepEqual(await page.evaluate(() => window.request.appliedFilters), presetDates);
  assert.deepEqual(await storedDates(page), presetDates);
  assert.equal(presetDates.endDate, "2026-11-04T16:00:00");
  assert.deepEqual(errors, []);
});

test("Sales persists applied preset identity without changing the saved dates and labels the applied range", async (t) => {
  const { page, errors } = await openSalesFixture(t);
  await page.evaluate(() => {
    window.settings = { data: { defaultPageDateRange: { value: 12 }, historyDateRanges: [{ unit: "week", value: 2 }] }, isSuccess: true };
    window.renderSales();
  });
  const preset = page.getByLabel("Rangos predefinidos");
  const status = page.getByRole("status");
  const start = page.getByLabel("Desde", { exact: true });
  const end = page.getByLabel("Hasta", { exact: true });
  const search = page.getByRole("button", { name: "Buscar" });
  const remount = async () => {
    await page.evaluate(() => window.remountSales());
    await page.waitForFunction(() => window.request.hydrated);
  };
  const expectLabel = (label) => expect(status).toHaveText(`Rango aplicado: ${label}`);
  await expectLabel("Últimos 12 meses");
  assert.equal((await savedFilters(page)).defaultRangeMonths, "12");

  for (const width of [1366, 390]) {
    await page.setViewportSize({ width, height: 768 });
    const indicator = await status.boundingBox();
    const dateInput = await end.boundingBox();
    assert.ok(indicator.width > 0 && indicator.x >= 0 && indicator.x + indicator.width <= width);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    if (width > 767) assert.ok(indicator.x > dateInput.x && indicator.y < dateInput.y + dateInput.height);
    else assert.ok(indicator.y >= dateInput.y + dateInput.height);
  }

  await preset.selectOption("base_month");
  await expectLabel("Últimos 12 meses");
  assert.equal((await savedFilters(page)).presetRange, "");
  await search.click();
  await expectLabel("Este mes");
  const month = await savedFilters(page);
  assert.equal(month.presetRange, "base_month");
  assert.equal(month.defaultRangeMonths, "");
  await page.clock.setFixedTime(new Date("2026-11-02T16:30:45Z"));
  await remount();
  assert.equal(await preset.inputValue(), "base_month");
  assert.deepEqual(await storedDates(page), datesOf(month));

  await preset.selectOption("base_today");
  await expectLabel("Este mes");
  assert.deepEqual(await savedFilters(page), month);
  await preset.selectOption("base_month");
  await start.fill("2026-11-02");
  await expectLabel("Este mes");
  await search.click();
  await expectLabel("1 día");
  assert.equal(await preset.inputValue(), "");
  assert.equal((await savedFilters(page)).presetRange, "");

  await preset.selectOption("custom_week_2");
  await end.press("Enter");
  await expectLabel("Últimas 2 semanas");
  const custom = await savedFilters(page);
  assert.equal(custom.presetRange, "custom_week_2");
  await remount();
  assert.equal(await preset.inputValue(), "custom_week_2");
  assert.deepEqual(await storedDates(page), datesOf(custom));
  await page.evaluate(() => { window.settings.data = { ...window.settings.data, historyDateRanges: [] }; });
  await remount();
  assert.equal(await preset.inputValue(), "");
  await expectLabel("15 días");
  assert.deepEqual(await storedDates(page), datesOf(custom));

  await preset.selectOption("base_today");
  await search.click();
  await expectLabel("Hoy");
  const today = await savedFilters(page);
  await page.clock.setFixedTime(new Date("2026-11-03T15:30:45Z"));
  await remount();
  await expectLabel("1 día");
  assert.equal(await preset.inputValue(), "");
  assert.deepEqual(await storedDates(page), datesOf(today));

  await page.evaluate((legacy) => localStorage.setItem("budgetsFilters", JSON.stringify(legacy)), datesOf(month));
  await remount();
  await expectLabel("2 días");
  assert.equal(await preset.inputValue(), "");
  assert.deepEqual(await storedDates(page), datesOf(month));

  await page.getByRole("button", { name: "Restaurar fechas", exact: true }).click();
  await expectLabel("Últimos 12 meses");
  assert.equal(await preset.inputValue(), "");
  assert.equal((await savedFilters(page)).defaultRangeMonths, "12");
  assert.deepEqual(errors, []);
});

test("Sales replaces malformed, incomplete or invalid saved dates using Settings and the three-month fallback", async (t) => {
  const { page, errors } = await openSalesFixture(t);
  const startDate = "2026-09-02T15:30:45";
  const endDate = "2026-11-02T15:30:45";
  for (const [storage, setting, expectedStart] of [
    ["{", 12, "2025-11-02T15:30:45"],
    ["null", 12, "2025-11-02T15:30:45"],
    [JSON.stringify({ endDate }), 12, "2025-11-02T15:30:45"],
    [JSON.stringify({ startDate }), 12, "2025-11-02T15:30:45"],
    [JSON.stringify({ startDate: "2026-02-30T00:00:00", endDate }), 12, "2025-11-02T15:30:45"],
    [JSON.stringify({ startDate: endDate, endDate: startDate }), 12, "2025-11-02T15:30:45"],
    ["{", "inválido", "2026-08-02T15:30:45"],
  ]) {
    await page.evaluate(({ storage, setting }) => {
      localStorage.setItem("budgetsFilters", storage);
      window.settings = { data: { defaultPageDateRange: { value: setting } }, isSuccess: true, isFetching: false };
      window.remountSales();
    }, { storage, setting });
    await page.waitForFunction(() => window.request.hydrated);
    const expected = { startDate: expectedStart, endDate };
    assert.deepEqual(await storedDates(page), expected);
    const enabledRanges = await page.evaluate(() => window.renders.filter(({ hydrated }) => hydrated).map(({ appliedFilters }) => appliedFilters));
    assert.ok(enabledRanges.length);
    assert.ok(enabledRanges.every((applied) => applied.startDate === expected.startDate && applied.endDate === expected.endDate));
    assert.equal(await page.evaluate(() => window.applies.length), 1);
  }
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
