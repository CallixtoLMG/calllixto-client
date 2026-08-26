const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const Module = require("node:module");
const babel = require("@babel/core");
const React = require("react");
const { renderToString } = require("react-dom/server");
const { QueryClient, QueryClientProvider } = require("@tanstack/react-query");

const root = path.join(__dirname, "..", "..");
const originalResolveFilename = Module._resolveFilename;
const originalLoad = Module._load;
const originalJsLoader = Module._extensions[".js"];
let hookScenario = "ready";

Module._resolveFilename = function resolveAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    return originalResolveFilename.call(this, path.join(root, "src", request.slice(2)), parent, isMain, options);
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const compileLocalModule = (module, filename) => {
  if (!filename.startsWith(path.join(root, "src"))) {
    return originalJsLoader(module, filename);
  }

  const source = fs.readFileSync(filename, "utf8");
  const { code } = babel.transformSync(source, {
    filename,
    presets: [
      [require.resolve("@babel/preset-env"), { targets: { node: "current" }, modules: "commonjs" }],
      [require.resolve("@babel/preset-react"), { runtime: "automatic" }],
    ],
    babelrc: false,
    configFile: false,
  });

  module._compile(code, filename);
};

Module._extensions[".js"] = compileLocalModule;
Module._extensions[".jsx"] = compileLocalModule;

const AUGUST_RANGE = { from: "2026-08-01", to: "2026-08-31" };
const JULY_RANGE = { from: "2026-07-01", to: "2026-07-31" };
const AUGUST_WEEK_RANGE = { from: "2026-08-01", to: "2026-08-07" };
const THIRTY_TWO_DAY_RANGE = { from: "2026-07-01", to: "2026-08-01" };
const ONE_HUNDRED_TWENTY_DAY_RANGE = { from: "2026-05-01", to: "2026-08-28" };
const ONE_HUNDRED_TWENTY_ONE_DAY_RANGE = { from: "2026-04-30", to: "2026-08-28" };
const JUNE_TO_AUGUST_RANGE = { from: "2026-06-01", to: "2026-08-25" };
const JANUARY_TO_AUGUST_RANGE = { from: "2026-01-01", to: "2026-08-25" };
const AUGUST_TO_25_RANGE = { from: "2026-08-01", to: "2026-08-25" };
const AUGUST_FIRST_DAYS_RANGE = { from: "2026-08-01", to: "2026-08-04" };
const OFFICIAL_EMPTY_RANGE = { from: "2026-05-05", to: "2026-05-11" };
const EXPENSE_ONLY_RANGE = { from: "2026-05-10", to: "2026-05-12" };

const formatNumber = (number) => Number(number).toLocaleString("es-AR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const sumNetSales = (items) => items.reduce((total, item) => total + item.netSales, 0);
const sumAmount = (items, field = "amount") => items.reduce((total, item) => total + item[field], 0);

const queryFor = (section) => {
  if (hookScenario === "productsError" && section === "products") {
    return { data: undefined, isLoading: false, error: new Error("products-error") };
  }

  if (hookScenario === "expensesError" && section === "expenses") {
    return { data: undefined, isLoading: false, error: new Error("expenses-error") };
  }

  if (hookScenario === "empty") {
    return {
      data: {
        overview: analyticsMock.buildMockOverview({
          range: OFFICIAL_EMPTY_RANGE,
          comparisonRange: { from: "2026-04-28", to: "2026-05-04" },
        }),
        sales: analyticsMock.buildMockSalesTimeseries({ range: OFFICIAL_EMPTY_RANGE }),
        products: analyticsMock.buildMockProducts({ range: OFFICIAL_EMPTY_RANGE }),
        expenses: analyticsMock.buildMockExpenses({ range: OFFICIAL_EMPTY_RANGE }),
      }[section],
      isLoading: false,
      error: null,
    };
  }

  if (hookScenario === "expenseOnly") {
    return {
      data: {
        overview: analyticsMock.buildMockOverview({
          range: EXPENSE_ONLY_RANGE,
          comparisonRange: { from: "2026-05-07", to: "2026-05-09" },
        }),
        sales: analyticsMock.buildMockSalesTimeseries({ range: EXPENSE_ONLY_RANGE }),
        products: analyticsMock.buildMockProducts({ range: EXPENSE_ONLY_RANGE }),
        expenses: analyticsMock.buildMockExpenses({ range: EXPENSE_ONLY_RANGE }),
      }[section],
      isLoading: false,
      error: null,
    };
  }

  if (hookScenario === "week") {
    return {
      data: {
        overview: analyticsMock.buildMockOverview({
          range: AUGUST_WEEK_RANGE,
          comparisonRange: { from: "2026-07-25", to: "2026-07-31" },
        }),
        sales: analyticsMock.buildMockSalesTimeseries({ range: AUGUST_WEEK_RANGE }),
        products: analyticsMock.buildMockProducts({ range: AUGUST_WEEK_RANGE }),
        expenses: analyticsMock.buildMockExpenses({ range: AUGUST_WEEK_RANGE }),
      }[section],
      isLoading: false,
      error: null,
    };
  }

  if (hookScenario === "weeklyGranularity") {
    return {
      data: {
        overview: analyticsMock.buildMockOverview({ range: JUNE_TO_AUGUST_RANGE }),
        sales: analyticsMock.buildMockSalesTimeseries({ range: JUNE_TO_AUGUST_RANGE }),
        products: analyticsMock.buildMockProducts({ range: JUNE_TO_AUGUST_RANGE }),
        expenses: analyticsMock.buildMockExpenses({ range: JUNE_TO_AUGUST_RANGE }),
      }[section],
      isLoading: false,
      error: null,
    };
  }

  if (hookScenario === "monthlyGranularity") {
    return {
      data: {
        overview: analyticsMock.buildMockOverview({ range: JANUARY_TO_AUGUST_RANGE }),
        sales: analyticsMock.buildMockSalesTimeseries({ range: JANUARY_TO_AUGUST_RANGE }),
        products: analyticsMock.buildMockProducts({ range: JANUARY_TO_AUGUST_RANGE }),
        expenses: analyticsMock.buildMockExpenses({ range: JANUARY_TO_AUGUST_RANGE }),
      }[section],
      isLoading: false,
      error: null,
    };
  }

  return {
    data: {
      overview: analyticsMock.buildMockOverview({
        range: AUGUST_RANGE,
        comparisonRange: JULY_RANGE,
      }),
      sales: analyticsMock.buildMockSalesTimeseries({ range: AUGUST_RANGE }),
      products: analyticsMock.buildMockProducts({ range: AUGUST_RANGE }),
      expenses: analyticsMock.buildMockExpenses({ range: AUGUST_RANGE }),
    }[section],
    isLoading: false,
    error: null,
  };
};

const queryForExpenseDetails = ({ category, range }) => {
  if (hookScenario === "detailError") {
    return { data: undefined, isLoading: false, error: new Error("detail-error") };
  }

  return {
    data: analyticsMock.buildMockExpenseCategoryDetails({ category, range: range ?? AUGUST_RANGE }),
    isLoading: false,
    error: null,
  };
};

Module._load = function loadWithAnalyticsMocks(request, parent, isMain) {
  if (request === "@/api/analytics") {
    return {
      useAnalyticsOverview: () => queryFor("overview"),
      useAnalyticsSalesTimeseries: () => queryFor("sales"),
      useAnalyticsTopProducts: () => queryFor("products"),
      useAnalyticsExpenses: () => queryFor("expenses"),
      useAnalyticsExpenseCategoryDetails: queryForExpenseDetails,
    };
  }

  if (request === "@/common/utils") {
    return {
      getFormatedNumber: formatNumber,
      getFormatedPrice: (number) => Number(number).toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
    };
  }

  if (request === "@/common/constants") {
    return {
      COLORS: { BLUE: "blue", RED: "red" },
      ICONS: { CHECK: "check", INFO_CIRCLE: "info circle", TIMES: "times" },
      SIZES: { LARGE: "large" },
    };
  }

  if (request === "@/common/components/buttons") {
    return {
      IconedButton: ({ text, disabled, onClick }) => React.createElement("button", { disabled, onClick }, text),
    };
  }

  if (request === "@/common/components/tooltips") {
    return {
      IconTooltip: ({ content, ariaLabel }) => React.createElement("span", { "aria-label": ariaLabel }, content),
    };
  }

  if (request === "@/common/components/table") {
    return {
      Table: ({ headers, elements, mainKey = "id" }) => React.createElement("table", {},
        React.createElement("thead", {},
          React.createElement("tr", {}, headers.map((header) =>
            React.createElement("th", { key: header.id }, header.title)
          ))
        ),
        React.createElement("tbody", {}, elements.map((element, index) =>
          React.createElement("tr", { key: element[mainKey] ?? index }, headers.map((header) =>
            React.createElement("td", { key: header.id }, header.value(element, index))
          ))
        ))
      ),
    };
  }

  if (request === "next/navigation") {
    return {
      useRouter: () => ({ push: () => undefined }),
    };
  }

  return originalLoad.call(this, request, parent, isMain);
};

const analyticsMock = require("../../src/components/analytics/analytics.mock.js");
const AnalyticsPage = require("../../src/components/analytics/AnalyticsPage").default;

const renderAnalytics = (scenario = "ready") => {
  hookScenario = scenario;
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return renderToString(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(AnalyticsPage, {})
    )
  );
};

test("analytics mock ranges produce different correct aggregates", () => {
  const august = analyticsMock.buildMockOverview({
    range: AUGUST_RANGE,
    comparisonRange: JULY_RANGE,
  });
  const july = analyticsMock.buildMockOverview({
    range: JULY_RANGE,
    comparisonRange: { from: "2026-06-01", to: "2026-06-30" },
  });

  assert.equal(august.kpis.netSales.value, 8299000);
  assert.equal(august.kpis.salesCount.value, 380);
  assert.equal(august.kpis.averageTicket.value, 21839.47);
  assert.equal(august.kpis.expenses.value, 1280000);
  assert.equal(july.kpis.netSales.value, 6169000);
  assert.notEqual(august.kpis.netSales.value, july.kpis.netSales.value);
});

test("sales timeseries previous period is immediately previous equivalent range", () => {
  const series = analyticsMock.buildMockSalesTimeseries({ range: AUGUST_WEEK_RANGE });

  assert.equal(series.current.length, 7);
  assert.equal(series.previous.length, 7);
  assert.deepEqual(series.current.map(({ periodStart, netSales, salesCount, grossProfit }) => [
    periodStart,
    netSales,
    salesCount,
    grossProfit,
  ]), [
    ["2026-08-01", 250000, 12, 72500],
    ["2026-08-02", 272000, 13, 76160],
    ["2026-08-03", 0, 0, 0],
    ["2026-08-04", 309000, 14, 92700],
    ["2026-08-05", 336000, 16, 97440],
    ["2026-08-06", 0, 0, 0],
    ["2026-08-07", 266000, 12, 74480],
  ]);
  assert.deepEqual(series.previous.map(({ periodStart, netSales }) => [periodStart, netSales]), [
    ["2026-07-25", 0],
    ["2026-07-26", 305000],
    ["2026-07-27", 343000],
    ["2026-07-28", 391000],
    ["2026-07-29", 442000],
    ["2026-07-30", 387000],
    ["2026-07-31", 336000],
  ]);
  assert.deepEqual([series.current[0].periodStart, series.previous[0].periodStart], ["2026-08-01", "2026-07-25"]);
  assert.equal(series.previous.reduce((total, item) => total + item.netSales, 0), 2204000);
});

test("sales timeseries chooses automatic granularity by inclusive day count", () => {
  assert.equal(analyticsMock.buildMockSalesTimeseries({ range: AUGUST_RANGE }).groupBy, "day");
  assert.equal(analyticsMock.buildMockSalesTimeseries({ range: THIRTY_TWO_DAY_RANGE }).groupBy, "week");
  assert.equal(analyticsMock.buildMockSalesTimeseries({ range: ONE_HUNDRED_TWENTY_DAY_RANGE }).groupBy, "week");
  assert.equal(analyticsMock.buildMockSalesTimeseries({ range: ONE_HUNDRED_TWENTY_ONE_DAY_RANGE }).groupBy, "month");
});

test("weekly timeseries aggregates from selected start and preserves sales total", () => {
  const overview = analyticsMock.buildMockOverview({ range: JUNE_TO_AUGUST_RANGE });
  const series = analyticsMock.buildMockSalesTimeseries({ range: JUNE_TO_AUGUST_RANGE });

  assert.equal(series.groupBy, "week");
  assert.deepEqual(series.current.map(({ periodStart, periodEnd }) => [periodStart, periodEnd]), [
    ["2026-06-01", "2026-06-07"],
    ["2026-06-08", "2026-06-14"],
    ["2026-06-15", "2026-06-21"],
    ["2026-06-22", "2026-06-28"],
    ["2026-06-29", "2026-07-05"],
    ["2026-07-06", "2026-07-12"],
    ["2026-07-13", "2026-07-19"],
    ["2026-07-20", "2026-07-26"],
    ["2026-07-27", "2026-08-02"],
    ["2026-08-03", "2026-08-09"],
    ["2026-08-10", "2026-08-16"],
    ["2026-08-17", "2026-08-23"],
    ["2026-08-24", "2026-08-25"],
  ]);
  assert.equal(sumNetSales(series.current), overview.kpis.netSales.value);
});

test("monthly timeseries aggregates calendar months and preserves sales total", () => {
  const overview = analyticsMock.buildMockOverview({ range: JANUARY_TO_AUGUST_RANGE });
  const series = analyticsMock.buildMockSalesTimeseries({ range: JANUARY_TO_AUGUST_RANGE });

  assert.equal(series.groupBy, "month");
  assert.deepEqual(series.current.map(({ periodStart, periodEnd }) => [periodStart, periodEnd]), [
    ["2026-01-01", "2026-01-31"],
    ["2026-02-01", "2026-02-28"],
    ["2026-03-01", "2026-03-31"],
    ["2026-04-01", "2026-04-30"],
    ["2026-05-01", "2026-05-31"],
    ["2026-06-01", "2026-06-30"],
    ["2026-07-01", "2026-07-31"],
    ["2026-08-01", "2026-08-25"],
  ]);
  assert.equal(sumNetSales(series.current), overview.kpis.netSales.value);
});

test("weekly current and previous buckets stay aligned by relative bucket size", () => {
  const series = analyticsMock.buildMockSalesTimeseries({ range: JUNE_TO_AUGUST_RANGE });

  assert.equal(series.current.length, series.previous.length);
  assert.deepEqual(series.previous.map(({ periodStart, periodEnd }) => [periodStart, periodEnd]), [
    ["2026-03-07", "2026-03-13"],
    ["2026-03-14", "2026-03-20"],
    ["2026-03-21", "2026-03-27"],
    ["2026-03-28", "2026-04-03"],
    ["2026-04-04", "2026-04-10"],
    ["2026-04-11", "2026-04-17"],
    ["2026-04-18", "2026-04-24"],
    ["2026-04-25", "2026-05-01"],
    ["2026-05-02", "2026-05-08"],
    ["2026-05-09", "2026-05-15"],
    ["2026-05-16", "2026-05-22"],
    ["2026-05-23", "2026-05-29"],
    ["2026-05-30", "2026-05-31"],
  ]);
});

test("gross margin comparison uses percentage points", () => {
  const overview = analyticsMock.buildMockOverview({
    range: AUGUST_RANGE,
    comparisonRange: JULY_RANGE,
  });

  assert.equal(overview.kpis.grossMargin.value, 29.76);
  assert.equal(overview.kpis.grossMargin.previousValue, 28.84);
  assert.equal(overview.kpis.grossMargin.changePercentagePoints, 0.92);
});

test("expenses increase is configured as visually negative", () => {
  const source = fs.readFileSync(path.join(root, "src", "components", "analytics", "analytics.constants.js"), "utf8");
  const expensesBlock = source.slice(source.indexOf('key: "expenses"'), source.indexOf("];", source.indexOf('key: "expenses"')));

  assert.match(expensesBlock, /higherIsPositive:\s*false/);
});

test("official empty range returns empty contracts and global empty state", () => {
  const overview = analyticsMock.buildMockOverview({
    range: OFFICIAL_EMPTY_RANGE,
    comparisonRange: { from: "2026-04-28", to: "2026-05-04" },
  });
  const products = analyticsMock.buildMockProducts({ range: OFFICIAL_EMPTY_RANGE });
  const expenses = analyticsMock.buildMockExpenses({ range: OFFICIAL_EMPTY_RANGE });
  const series = analyticsMock.buildMockSalesTimeseries({ range: OFFICIAL_EMPTY_RANGE });
  const html = renderAnalytics("empty");

  assert.equal(overview.kpis.netSales.value, 0);
  assert.deepEqual(products.items, []);
  assert.deepEqual(expenses.categories, []);
  assert.equal(series.current.length, 7);
  assert.equal(series.current.every(({ netSales, salesCount, grossProfit }) =>
    netSales === 0 && salesCount === 0 && grossProfit === 0
  ), true);
  assert.match(html, /No hay datos para este período/);
  assert.doesNotMatch(html, /Ventas netas/);
});

test("range with expenses but no sales is not global empty", () => {
  const expenses = analyticsMock.buildMockExpenses({ range: EXPENSE_ONLY_RANGE });
  const series = analyticsMock.buildMockSalesTimeseries({ range: EXPENSE_ONLY_RANGE });
  const html = renderAnalytics("expenseOnly");

  assert.equal(series.current.length, 3);
  assert.equal(series.current.every(({ netSales, salesCount, grossProfit }) =>
    netSales === 0 && salesCount === 0 && grossProfit === 0
  ), true);
  assert.equal(expenses.total, 185000);
  assert.doesNotMatch(html, /No hay datos para este período/);
  assert.match(html, /Ventas netas/);
});

test("expense category details reconcile with dashboard category total", () => {
  const expenses = analyticsMock.buildMockExpenses({ range: AUGUST_TO_25_RANGE });
  const servicesCategory = expenses.categories.find(({ name }) => name === "Servicios");
  const details = analyticsMock.buildMockExpenseCategoryDetails({ category: "Servicios", range: AUGUST_TO_25_RANGE });

  assert.equal(servicesCategory.amount, 196000);
  assert.equal(details.total, servicesCategory.amount);
  assert.equal(sumAmount(details.items), details.total);
  assert.equal(sumAmount(details.items, "paidAmount") + sumAmount(details.items, "pendingAmount"), details.total);
  details.items.forEach((item) => {
    assert.equal(item.pendingAmount, item.amount - item.paidAmount);
  });
});

test("expense category details respect the applied range argument", () => {
  const details = analyticsMock.buildMockExpenseCategoryDetails({ category: "Servicios", range: AUGUST_FIRST_DAYS_RANGE });

  assert.deepEqual(details.items.map(({ name, amount }) => [name, amount]), [
    ["Internet oficina", 46000],
  ]);
});

test("expense category details return empty contract for category without records", () => {
  const details = analyticsMock.buildMockExpenseCategoryDetails({ category: "Sin detalle", range: AUGUST_TO_25_RANGE });

  assert.equal(details.total, 0);
  assert.deepEqual(details.items, []);
});

test("expense drill-down is wired through the analytics provider and applied range", () => {
  const source = fs.readFileSync(path.join(root, "src", "components", "analytics", "AnalyticsPage", "index.jsx"), "utf8");

  assert.match(source, /useAnalyticsExpenseCategoryDetails/);
  assert.match(source, /onClick=\{\(\) => setSelectedCategory\(category\)\}/);
  assert.match(source, /range=\{appliedRange\}/);
  assert.doesNotMatch(source, /getExpensesForRange/);
});

test("expense detail modal uses shared table and Callixto close styling", () => {
  const source = fs.readFileSync(path.join(root, "src", "components", "analytics", "AnalyticsPage", "index.jsx"), "utf8");

  assert.match(source, /import \{ Table \} from "@\/common\/components\/table"/);
  assert.match(source, /<Table\s+headers=\{detailHeaders\}/);
  assert.match(source, /Gastos de \{formatCategoryName\(category\?\.name\)\}/);
  assert.match(source, /text="Cerrar"[\s\S]*icon=\{ICONS\.TIMES\}[\s\S]*color=\{COLORS\.RED\}/);
});

test("expense detail error does not break dashboard render", () => {
  const html = renderAnalytics("detailError");

  assert.match(html, /Gastos por categoría/);
  assert.match(html, /Ventas netas/);
});

test("localized products or expenses error does not break the rest of dashboard", () => {
  const productsErrorHtml = renderAnalytics("productsError");
  const expensesErrorHtml = renderAnalytics("expensesError");

  assert.match(productsErrorHtml, /Ventas netas/);
  assert.match(productsErrorHtml, /Evolución de ventas/);
  assert.match(productsErrorHtml, /Gastos por categoría/);
  assert.match(expensesErrorHtml, /Ventas netas/);
  assert.match(expensesErrorHtml, /Evolución de ventas/);
  assert.match(expensesErrorHtml, /Top productos por facturación/);
});

test("apply period button disabled and enabled conditions stay wired to draft range", () => {
  const source = fs.readFileSync(path.join(root, "src", "components", "analytics", "AnalyticsPage", "index.jsx"), "utf8");
  const html = renderAnalytics();

  assert.match(html, /Aplicar período/);
  assert.match(html, /disabled=""/);
  assert.match(source, /const hasDraftChanges = !areSameRange\(draftRange, appliedRange\)/);
  assert.match(source, /const canApplyRange = hasDraftChanges && isValidRange\(draftRange\)/);
  assert.match(source, /disabled=\{!canApplyRange\}/);
});

test("kpi info tooltips and chart tooltip data are exposed", () => {
  const html = renderAnalytics();
  const weekHtml = renderAnalytics("week");

  [
    "Importe total vendido en el período seleccionado.",
    "Número de ventas registradas en el período.",
    "Importe promedio por cada venta del período.",
    "Ventas menos el costo histórico de los productos vendidos.",
    "Porcentaje de las ventas que queda luego del costo de los productos.",
    "Total de gastos registrados, estén pagados o pendientes.",
  ].forEach((copy) => assert.match(html, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));

  assert.match(html, /data-tooltip-date=/);
  assert.match(html, /data-tooltip-current=/);
  assert.match(html, /data-tooltip-previous=/);
  assert.match(
    weekHtml,
    /data-tooltip-date="2026-08-01"[^>]+data-tooltip-current="250000"[^>]+data-tooltip-previous="0"/
  );
});

test("sales chart uses resolved groupBy labels", () => {
  assert.match(renderAnalytics(), /Diario/);
  assert.match(renderAnalytics("weeklyGranularity"), /Semanal/);
  assert.match(renderAnalytics("monthlyGranularity"), /Mensual/);
});

test("sales chart keeps invisible hover targets without persistent sampled markers", () => {
  const apiSource = fs.readFileSync(path.join(root, "src", "api", "analytics.js"), "utf8");
  const chartSource = fs.readFileSync(path.join(root, "src", "components", "analytics", "AnalyticsPage", "index.jsx"), "utf8");
  const html = renderAnalytics("weeklyGranularity");

  assert.match(apiSource, /groupBy:\s*source\.groupBy/);
  assert.doesNotMatch(chartSource, /index % 6/);
  assert.match(html, /data-tooltip-date=/);
  assert.match(html, /fill="transparent" stroke="transparent"/);
  assert.doesNotMatch(html, /fill="#ffffff" stroke="#2185d0"/);
});
