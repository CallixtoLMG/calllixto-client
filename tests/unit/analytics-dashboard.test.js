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
const AUGUST_CANCELLED_LATER_RANGE = { from: "2026-08-20", to: "2026-08-20" };
const SEPTEMBER_CANCELLATION_RANGE = { from: "2026-09-05", to: "2026-09-05" };
const SEPTEMBER_PARTIAL_COST_RANGE = { from: "2026-09-10", to: "2026-09-12" };
const OCTOBER_UNKNOWN_COST_RANGE = { from: "2026-10-01", to: "2026-10-02" };
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

  if (hookScenario === "partialCoverage") {
    return {
      data: {
        overview: analyticsMock.buildMockOverview({ range: SEPTEMBER_PARTIAL_COST_RANGE }),
        sales: analyticsMock.buildMockSalesTimeseries({ range: SEPTEMBER_PARTIAL_COST_RANGE }),
        products: analyticsMock.buildMockProducts({ range: SEPTEMBER_PARTIAL_COST_RANGE }),
        expenses: analyticsMock.buildMockExpenses({ range: SEPTEMBER_PARTIAL_COST_RANGE }),
      }[section],
      isLoading: false,
      error: null,
    };
  }

  if (hookScenario === "zeroCoverage") {
    return {
      data: {
        overview: analyticsMock.buildMockOverview({ range: OCTOBER_UNKNOWN_COST_RANGE }),
        sales: analyticsMock.buildMockSalesTimeseries({ range: OCTOBER_UNKNOWN_COST_RANGE }),
        products: analyticsMock.buildMockProducts({ range: OCTOBER_UNKNOWN_COST_RANGE }),
        expenses: analyticsMock.buildMockExpenses({ range: OCTOBER_UNKNOWN_COST_RANGE }),
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
      useAnalyticsSalesRanking: ({ range, dimension }) => {
        if (hookScenario === "productsError") {
          return { data: undefined, isLoading: false, error: new Error("ranking-error") };
        }

        if (hookScenario === "empty") {
          return {
            data: {
              range,
              dimension,
              items: [],
            },
            isLoading: false,
            error: null,
          };
        }

        return {
          data: analyticsMock.buildMockSalesRanking({ range: range ?? AUGUST_RANGE, dimension }),
          isLoading: false,
          error: null,
        };
      },
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
      COLORS: { BLUE: "blue", ORANGE: "orange", RED: "red" },
      ICONS: { CHECK: "check", CHEVRON_RIGHT: "chevron right", EXCLAMATION_CIRCLE: "exclamation circle", INFO_CIRCLE: "info circle", TIMES: "times" },
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

  if (request === "@/components/layout/Loader") {
    return {
      Loader: ({ active, message, children }) => active
        ? React.createElement("div", { role: "status" }, message)
        : children,
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

const renderAnalytics = (scenario = "ready", props = {}) => {
  hookScenario = scenario;
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return renderToString(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(AnalyticsPage, props)
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

test("net sales are confirmed sales minus cancellations from the selected period", () => {
  const august = analyticsMock.buildMockOverview({
    range: AUGUST_RANGE,
    comparisonRange: JULY_RANGE,
  });
  const cancellationDay = analyticsMock.buildMockOverview({ range: SEPTEMBER_CANCELLATION_RANGE });

  assert.deepEqual(august.salesComposition, {
    confirmedSales: 8299000,
    cancellations: 0,
    netSales: 8299000,
  });
  assert.deepEqual(cancellationDay.salesComposition, {
    confirmedSales: 0,
    cancellations: 389000,
    netSales: -389000,
  });
  assert.equal(cancellationDay.kpis.netSales.value, -389000);
});

test("sales use confirmedAt and cancellations use cancelledAt across periods", () => {
  const confirmedDay = analyticsMock.buildMockOverview({ range: AUGUST_CANCELLED_LATER_RANGE });
  const cancelledDay = analyticsMock.buildMockSalesTimeseries({ range: SEPTEMBER_CANCELLATION_RANGE });

  assert.equal(confirmedDay.salesComposition.confirmedSales, 389000);
  assert.equal(confirmedDay.salesComposition.cancellations, 0);
  assert.equal(confirmedDay.salesComposition.netSales, 389000);
  assert.deepEqual(cancelledDay.current.map(({ periodStart, netSales, salesCount }) => [
    periodStart,
    netSales,
    salesCount,
  ]), [
    ["2026-09-05", -389000, 0],
  ]);
});

test("margin coverage is 100 percent when every sale has historical cost", () => {
  const overview = analyticsMock.buildMockOverview({
    range: AUGUST_RANGE,
    comparisonRange: JULY_RANGE,
  });

  assert.deepEqual(overview.marginCoverage, {
    revenueWithKnownCost: 8299000,
    revenueWithoutKnownCost: 0,
    percentage: 100,
  });
  assert.equal(overview.kpis.grossProfit.isAvailable, true);
  assert.equal(overview.kpis.grossMargin.isAvailable, true);
  assert.equal(overview.kpis.grossProfit.tooltip, undefined);
});

test("partial margin coverage excludes unknown costs and treats zero cost as known", () => {
  const overview = analyticsMock.buildMockOverview({ range: SEPTEMBER_PARTIAL_COST_RANGE });

  assert.deepEqual(overview.marginCoverage, {
    revenueWithKnownCost: 122000,
    revenueWithoutKnownCost: 48000,
    percentage: 71.76,
  });
  assert.equal(overview.kpis.netSales.value, 170000);
  assert.equal(overview.kpis.grossProfit.value, 71600);
  assert.equal(overview.kpis.grossMargin.value, 58.69);
  assert.equal(overview.kpis.grossProfit.isAvailable, true);
  assert.match(overview.kpis.grossProfit.tooltip, /71\.76% de las ventas/);
});

test("zero margin coverage renders gross margin KPIs as unavailable", () => {
  const overview = analyticsMock.buildMockOverview({ range: OCTOBER_UNKNOWN_COST_RANGE });

  assert.deepEqual(overview.marginCoverage, {
    revenueWithKnownCost: 0,
    revenueWithoutKnownCost: 160000,
    percentage: 0,
  });
  assert.equal(overview.kpis.netSales.value, 160000);
  assert.equal(overview.kpis.grossProfit.value, null);
  assert.equal(overview.kpis.grossMargin.value, null);
  assert.equal(overview.kpis.grossProfit.isAvailable, false);
  assert.equal(overview.kpis.grossMargin.isAvailable, false);
  assert.match(overview.kpis.grossMargin.tooltip, /No hay costos informados/);
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

test("analytics exposes Resumen and Ventas tabs", () => {
  const html = renderAnalytics();

  assert.match(html, /Resumen/);
  assert.match(html, /Ventas/);
  assert.match(html, /Gastos/);
  assert.match(html, /Período anterior:[\s\S]*[0-9]{2}\/[0-9]{2} - [0-9]{2}\/[0-9]{2}[\s\S]*[0-9]+ días/);
  assert.doesNotMatch(html, /Comparado con/);
});

test("period state is owned above tabs and passed to both panes", () => {
  const source = fs.readFileSync(path.join(root, "src", "components", "analytics", "AnalyticsPage", "index.jsx"), "utf8");
  const appliedRangeIndex = source.indexOf("const [appliedRange");
  const panesIndex = source.indexOf("const panes =");

  assert(appliedRangeIndex > -1);
  assert(panesIndex > -1);
  assert(appliedRangeIndex < panesIndex);
  assert.match(source, /<SummaryPane[\s\S]*topProducts=\{topProducts\}/);
  assert.match(source, /<SalesPane[\s\S]*appliedRange=\{appliedRange\}/);
  assert.match(source, /<ExpensesPane[\s\S]*appliedRange=\{appliedRange\}/);
});

test("Resumen shows only the three executive KPIs", () => {
  const html = renderAnalytics();
  const source = fs.readFileSync(path.join(root, "src", "components", "analytics", "AnalyticsPage", "index.jsx"), "utf8");
  const summaryPane = source.slice(source.indexOf("const SummaryPane"), source.indexOf("const SalesPane"));

  assert.match(html, /Ventas netas/);
  assert.match(html, /Margen bruto/);
  assert.match(html, /Gasto neto/);
  assert.doesNotMatch(html, /Cantidad de ventas/);
  assert.doesNotMatch(html, /Ticket promedio/);
  assert.doesNotMatch(html, /Margen bruto %/);
  assert.match(summaryPane, /config=\{analyticsSummaryKpiConfig\}/);
  assert.match(fs.readFileSync(path.join(root, "src", "components", "analytics", "analytics.constants.js"), "utf8"), /ANALYTICS_SUMMARY_KPI_KEYS[\s\S]*"netSales"[\s\S]*"grossProfit"[\s\S]*"netExpense"/);
  assert.doesNotMatch(summaryPane, /columns=\{4\}/);
});

test("Resumen shows gross margin percentage next to the gross profit value", () => {
  const html = renderAnalytics();
  const source = fs.readFileSync(path.join(root, "src", "components", "analytics", "AnalyticsPage", "Kpis.jsx"), "utf8");

  assert.match(html, /29,76%[^<]*de margen/);
  assert.doesNotMatch(html, /Margen sobre ventas del período/);
  assert.match(html, /Ventas menos el costo histórico de los productos vendidos\./);
  assert.match(source, /<KpiValue>[\s\S]*<KpiSecondaryText>/);
});

test("Resumen shows compact highlights instead of full rankings", () => {
  const html = renderAnalytics();

  assert.match(html, /Highlights del período/);
  assert.match(html, /Producto líder/);
  assert.match(html, /Cetol Classic Brillante Natural 4 Lts\./);
  assert.doesNotMatch(html, /Sherwin Williams Loxon Exterior 20 Lts\./);
  assert.doesNotMatch(html, /Pintura látex premium interior y exterior lavable blanco mate balde de 20 litros/);
  assert.doesNotMatch(html, /Plavicon Membrana Liquida Fibrada 20 Kg\./);
  assert.match(html, /Principal categoría de gasto/);
  assert.doesNotMatch(html, /Top productos por facturación/);
  assert.doesNotMatch(html, /Gastos por categoría/);
  assert.doesNotMatch(html, /Importe neto ·/);
});

test("Resumen uses business evolution while Ventas keeps the comparative chart", () => {
  const source = fs.readFileSync(path.join(root, "src", "components", "analytics", "AnalyticsPage", "index.jsx"), "utf8");
  const html = renderAnalytics();
  const salesHtml = renderAnalytics("ready", { initialActiveTabIndex: 1 });
  const summaryPane = source.slice(source.indexOf("const SummaryPane"), source.indexOf("const SalesPane"));

  assert.match(html, /Evolución del negocio/);
  assert.match(html, /data-business-tooltip-sales=/);
  assert.match(html, /data-business-tooltip-expense=/);
  assert.doesNotMatch(html, /Evolución de ventas/);
  assert.doesNotMatch(html, /Ganancia|Resultado|Rentabilidad|Beneficio/);
  assert.match(summaryPane, /<BusinessEvolutionChart/);
  assert.doesNotMatch(summaryPane, /<SalesChart/);
  assert.doesNotMatch(summaryPane, /currentOnly/);
  assert.match(source, /const SalesPane[\s\S]*<SalesChart[\s\S]*error=\{salesTimeseries\.error\}[\s\S]*\/>/);
  assert.doesNotMatch(html, /Periodo anterior/);
  assert.doesNotMatch(html, /data-tooltip-previous=/);
  assert.match(salesHtml, /Periodo anterior/);
  assert.match(salesHtml, /data-tooltip-previous=/);
});

test("Ventas tab shows commercial KPIs without Gastos KPI", () => {
  const html = renderAnalytics("ready", { initialActiveTabIndex: 1 });

  assert.match(html, /Ventas netas/);
  assert.match(html, /Cantidad de ventas/);
  assert.match(html, /Ticket promedio/);
  assert.match(html, /Margen bruto/);
  assert.match(html, /Margen bruto %/);
  assert.match(html, /\+0,92 puntos porcentuales/);
  assert.match(html, /Período anterior:[^<]*28,84%/);
  assert.doesNotMatch(html, /p\.p\./);
  assert.doesNotMatch(html, /margen % previo/);
  assert.doesNotMatch(html, /Total de gastos registrados/);
  assert.doesNotMatch(html, /Gastos por categoría/);
});

test("Ventas tab shows a compact net sales composition", () => {
  const html = renderAnalytics("ready", { initialActiveTabIndex: 1 });

  assert.match(html, /Composición de ventas netas/);
  assert.match(html, /Ventas confirmadas/);
  assert.match(html, /Cancelaciones/);
  assert.match(html, /Ventas confirmadas menos cancelaciones registradas en el período\./);
});

test("Ventas tab explains partial margin coverage near margin KPIs", () => {
  const html = renderAnalytics("partialCoverage", { initialActiveTabIndex: 1 });

  assert.match(html, /El margen fue calculado sobre el 71\.76% de las ventas que tienen costo informado\./);
  assert.doesNotMatch(html, /Sin datos<!-- --> <!-- -->vs período anterior/);
});

test("Ventas tab shows Sin datos when no sales have informed costs", () => {
  const html = renderAnalytics("zeroCoverage", { initialActiveTabIndex: 1 });

  assert.match(html, /Sin datos/);
  assert.match(html, /No hay costos informados para calcular el margen de este período\./);
});

test("sales ranking defaults to Productos and exposes all dimensions", () => {
  const html = renderAnalytics("ready", { initialActiveTabIndex: 1 });

  assert.match(html, /Ranking por facturación/);
  assert.match(html, /Productos/);
  assert.match(html, /Marcas/);
  assert.match(html, /Proveedores/);
  assert.match(html, /Cetol Classic Brillante Natural 4 Lts\./);
  assert.match(html, /Rodillo profesional microfibra alta densidad 22 cm/);
});

test("sales ranking items are sorted by descending revenue", () => {
  const products = analyticsMock.buildMockSalesRanking({ range: AUGUST_RANGE, dimension: "products" }).items;
  const brands = analyticsMock.buildMockSalesRanking({ range: AUGUST_RANGE, dimension: "brands" }).items;
  const suppliers = analyticsMock.buildMockSalesRanking({ range: AUGUST_RANGE, dimension: "suppliers" }).items;

  [products, brands, suppliers].forEach((items) => {
    items.forEach((item, index) => {
      if (index === 0) return;
      assert(items[index - 1].revenue >= item.revenue);
    });
  });
});

test("sales ranking aggregates brands including Sin marca", () => {
  const products = analyticsMock.buildMockSalesRanking({ range: AUGUST_RANGE, dimension: "products" }).items;
  const brands = analyticsMock.buildMockSalesRanking({ range: AUGUST_RANGE, dimension: "brands" }).items;
  const sinMarcaProductRevenue = sumAmount(products.filter(({ brandName }) => brandName === "Sin marca"), "revenue");
  const sinMarca = brands.find(({ name }) => name === "Sin marca");

  assert(sinMarca);
  assert.equal(sinMarca.revenue, sinMarcaProductRevenue);
  assert.equal(sumAmount(brands, "revenue"), sumAmount(products, "revenue"));
});

test("sales ranking aggregates suppliers including Sin proveedor", () => {
  const products = analyticsMock.buildMockSalesRanking({ range: AUGUST_RANGE, dimension: "products" }).items;
  const suppliers = analyticsMock.buildMockSalesRanking({ range: AUGUST_RANGE, dimension: "suppliers" }).items;
  const sinProveedorProductRevenue = sumAmount(products.filter(({ supplierName }) => supplierName === "Sin proveedor"), "revenue");
  const sinProveedor = suppliers.find(({ name }) => name === "Sin proveedor");
  const source = fs.readFileSync(path.join(root, "src", "components", "analytics", "AnalyticsPage", "index.jsx"), "utf8");

  assert(sinProveedor);
  assert.equal(sinProveedor.revenue, sinProveedorProductRevenue);
  assert.equal(sumAmount(suppliers, "revenue"), sumAmount(products, "revenue"));
  assert.match(source, /Facturación generada por productos asociados a cada proveedor\./);
  assert.match(source, /tooltip:\s*"Facturación generada por productos asociados a cada proveedor\."/);
  assert.doesNotMatch(source.slice(source.indexOf("const SalesRanking"), source.indexOf("const SalesNetComposition")), /<PanelDescription>/);
  assert.match(source, /<RankingBody>/);
  assert.match(source, /<Loader active=\{ranking\.isLoading\}/);
  assert.match(source, /message="Cargando ranking\.\.\."/);
  assert.match(fs.readFileSync(path.join(root, "src", "components", "analytics", "AnalyticsPage", "styles.jsx"), "utf8"), /RankingBody[\s\S]*position:\s*relative/);
});

test("Ventas tab keeps empty range localized to sales blocks", () => {
  const html = renderAnalytics("empty", { initialActiveTabIndex: 1 });
  const ranking = analyticsMock.buildMockSalesRanking({ range: OFFICIAL_EMPTY_RANGE, dimension: "products" });

  assert.deepEqual(ranking.items, []);
  assert.match(html, /Ventas netas/);
  assert.match(html, /Todavía no hay ventas para graficar en este período/);
  assert.match(html, /No hay productos con facturación para este período/);
  assert.doesNotMatch(html, /No hay datos para este período/);
});

test("Ventas tab keeps automatic chart granularity", () => {
  const html = renderAnalytics("weeklyGranularity", { initialActiveTabIndex: 1 });

  assert.match(html, /Semanal/);
  assert.match(html, /data-tooltip-date=/);
});

test("Gastos tab renders expense KPIs, composition, chart and category ranking", () => {
  const html = renderAnalytics("ready", { initialActiveTabIndex: 2 });

  assert.match(html, /Gasto neto/);
  assert.match(html, /Pagado/);
  assert.match(html, /Pendiente/);
  assert.match(html, /Composición de gastos/);
  assert.match(html, /Gastos registrados/);
  assert.match(html, /Anulaciones/);
  assert.match(html, /Evolución de gastos/);
  assert.match(html, /Gastos por categoría/);
  assert.match(html, /data-expense-tooltip-registered=/);
  assert.match(html, /Importe/);
  assert.doesNotMatch(html, /Facturación generada/);
});

test("expense analytics computes net expense from createdAt and cancelledAt events", () => {
  const augustCancellationSource = analyticsMock.buildMockExpenses({ range: { from: "2026-08-30", to: "2026-08-30" } });
  const septemberCancellationEvent = analyticsMock.buildMockExpenses({ range: { from: "2026-09-05", to: "2026-09-05" } });

  assert.equal(augustCancellationSource.registeredAmount, 203000);
  assert.equal(augustCancellationSource.cancellationsAmount, 0);
  assert.equal(augustCancellationSource.netExpense, 203000);
  assert.equal(septemberCancellationEvent.registeredAmount, 0);
  assert.equal(septemberCancellationEvent.cancellationsAmount, 203000);
  assert.equal(septemberCancellationEvent.netExpense, -203000);
});

test("expense analytics derives paid and pending historically from paymentHistory dates", () => {
  const afterCutoffPayment = analyticsMock.buildMockExpenses({ range: { from: "2026-08-29", to: "2026-08-29" } });
  const partialPending = analyticsMock.buildMockExpenses({ range: { from: "2026-09-10", to: "2026-09-12" } });
  const mockSource = fs.readFileSync(path.join(root, "src", "components", "analytics", "analytics.mock.js"), "utf8");

  assert.equal(afterCutoffPayment.netExpense, 49000);
  assert.equal(afterCutoffPayment.paidAmount, 0);
  assert.equal(afterCutoffPayment.pendingAmount, 49000);
  assert.equal(partialPending.netExpense, 58000);
  assert.equal(partialPending.paidAmount, 28000);
  assert.equal(partialPending.pendingAmount, 30000);
  assert.match(mockSource, /Object\.values\(expense\.paymentHistory \?\? \{\}\)/);
  assert.doesNotMatch(mockSource, /item\.paymentHistory\.filter/);
});

test("expense paymentHistory mocks use object shape and are normalized by values", () => {
  const records = analyticsMock.analyticsExpenseMockRecords;
  const noPaymentExpense = records.find(({ name }) => name === "Servicios municipales pendientes de liquidacion");
  const multiplePaymentExpense = records.find(({ name }) => name === "Reparacion menor de mostrador");
  const futurePaymentExpense = records.find(({ name }) => name === "Seguro integral del local");
  const multiplePayments = Object.values(multiplePaymentExpense.paymentHistory);

  assert.equal(Array.isArray(noPaymentExpense.paymentHistory), false);
  assert.deepEqual(noPaymentExpense.paymentHistory, {});
  assert.equal(Array.isArray(multiplePaymentExpense.paymentHistory), false);
  assert.equal(multiplePayments.length, 2);
  assert.deepEqual(multiplePayments.map(({ date, amount }) => [date, amount]), [
    ["2026-09-11", 12000],
    ["2026-09-12", 16000],
  ]);
  assert.equal(futurePaymentExpense.paymentHistory["payment-20260903-1"].amount, 49000);
});

test("expense analytics groups by primaryCategory and keeps missing primary category explicit", () => {
  const maintenanceDay = analyticsMock.buildMockExpenses({ range: { from: "2026-08-04", to: "2026-08-04" } });
  const missingPrimaryDay = analyticsMock.buildMockExpenses({ range: { from: "2026-08-07", to: "2026-08-07" } });
  const mockSource = fs.readFileSync(path.join(root, "src", "components", "analytics", "analytics.mock.js"), "utf8");

  assert.equal(maintenanceDay.categories.find(({ name }) => name === "Mantenimiento")?.amount, 128000);
  assert.equal(maintenanceDay.categories.some(({ name }) => name === "Servicios"), false);
  assert.equal(missingPrimaryDay.categories.find(({ name }) => name === "Sin categoría principal")?.amount, 62000);
  assert.doesNotMatch(mockSource, /categories\[0\]/);
});

test("expense category drill-down exposes historical rows and state", () => {
  const services = analyticsMock.buildMockExpenseCategoryDetails({ category: "Servicios", range: AUGUST_TO_25_RANGE });
  const cancellation = analyticsMock.buildMockExpenseCategoryDetails({ category: "Alquiler", range: { from: "2026-09-05", to: "2026-09-05" } });

  assert.equal(services.total, 196000);
  assert.equal(services.items.length, 3);
  services.items.forEach((item) => {
    assert(item.state);
    assert.equal(item.paidAmount + item.pendingAmount, item.amount);
  });
  assert.deepEqual(cancellation.items.map(({ amount, state }) => [amount, state]), [[-203000, "CANCELLED"]]);
});

test("expense timeseries reuses automatic granularity thresholds", () => {
  const daily = analyticsMock.buildMockExpenses({ range: AUGUST_RANGE });
  const weekly = analyticsMock.buildMockExpenses({ range: THIRTY_TWO_DAY_RANGE });
  const monthly = analyticsMock.buildMockExpenses({ range: ONE_HUNDRED_TWENTY_ONE_DAY_RANGE });

  assert.equal(daily.groupBy, "day");
  assert.equal(weekly.groupBy, "week");
  assert.equal(monthly.groupBy, "month");
  assert.equal(weekly.timeseries[0].periodStart, THIRTY_TWO_DAY_RANGE.from);
  assert.equal(sumAmount(daily.timeseries, "netExpense"), daily.netExpense);
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
  const html = renderAnalytics("detailError", { initialActiveTabIndex: 2 });

  assert.match(html, /Gastos por categoría/);
  assert.match(html, /Gasto neto/);
});

test("localized products or expenses error does not break the rest of dashboard", () => {
  const productsErrorHtml = renderAnalytics("productsError");
  const expensesErrorHtml = renderAnalytics("expensesError");

  assert.match(productsErrorHtml, /Ventas netas/);
  assert.match(productsErrorHtml, /Evolución del negocio/);
  assert.doesNotMatch(productsErrorHtml, /Top productos por facturación/);
  assert.match(expensesErrorHtml, /Ventas netas/);
  assert.doesNotMatch(expensesErrorHtml, /Gastos por categoría/);
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
  const salesHtml = renderAnalytics("ready", { initialActiveTabIndex: 1 });
  const weekHtml = renderAnalytics("week", { initialActiveTabIndex: 1 });

  [
    "Importe total vendido en el período seleccionado.",
    "Ventas menos el costo histórico de los productos vendidos.",
    "Gastos registrados en el período menos anulaciones registradas en el período.",
  ].forEach((copy) => assert.match(html, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));

  [
    "Número de ventas registradas en el período.",
    "Importe promedio por cada venta del período.",
    "Porcentaje de las ventas que queda luego del costo de los productos.",
  ].forEach((copy) => assert.match(salesHtml, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));

  assert.match(html, /data-business-tooltip-date=/);
  assert.match(html, /data-business-tooltip-sales=/);
  assert.match(html, /data-business-tooltip-expense=/);
  assert.doesNotMatch(html, /data-tooltip-current=/);
  assert.doesNotMatch(html, /data-tooltip-previous=/);
  assert.match(salesHtml, /data-tooltip-previous=/);
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

test("sales chart keeps current-series point targets without persistent sampled markers", () => {
  const apiSource = fs.readFileSync(path.join(root, "src", "api", "analytics.js"), "utf8");
  const chartSource = fs.readFileSync(path.join(root, "src", "components", "analytics", "AnalyticsPage", "index.jsx"), "utf8");
  const salesChartSource = fs.readFileSync(path.join(root, "src", "components", "analytics", "AnalyticsPage", "SalesChart.jsx"), "utf8");
  const html = renderAnalytics("weeklyGranularity", { initialActiveTabIndex: 1 });

  assert.match(apiSource, /groupBy:\s*source\.groupBy/);
  assert.doesNotMatch(chartSource, /index % 6/);
  assert.match(salesChartSource, /<ChartTooltipTarget/);
  assert.match(salesChartSource, /cx=\{point\.x\}/);
  assert.match(salesChartSource, /cy=\{point\.y\}/);
  assert.doesNotMatch(salesChartSource, /bucketArea/);
  assert.match(html, /data-tooltip-date=/);
  assert.match(html, /fill="transparent" stroke="transparent"/);
  assert.doesNotMatch(html, /fill="#ffffff" stroke="#2185d0"/);
});

test("comparative sales chart renders active markers for both series without changing currentOnly", () => {
  const source = fs.readFileSync(path.join(root, "src", "components", "analytics", "AnalyticsPage", "SalesChart.jsx"), "utf8");
  const previousMarkerIndex = source.indexOf("hoveredPoint.previousCoordinate");
  const currentMarkerIndex = source.indexOf('fill="#2185d0"', previousMarkerIndex);

  assert.match(source, /const previousCoordinates = getChartCoordinates/);
  assert.match(source, /const previousCoordinate = currentOnly \? null : previousCoordinates\[index\]/);
  assert.match(source, /<ChartTooltipTarget/);
  assert.match(source, /r="13"/);
  assert.doesNotMatch(source, /<ChartTooltipArea/);
  assert.doesNotMatch(source, /width=\{bucketArea\.width\}/);
  assert.doesNotMatch(source, /height=\{bucketArea\.height\}/);
  assert.match(source, /fill="#98a2b3"/);
  assert.match(source, /r="9"[\s\S]*fill="#98a2b3"/);
  assert(previousMarkerIndex > -1);
  assert(currentMarkerIndex > previousMarkerIndex);
});
