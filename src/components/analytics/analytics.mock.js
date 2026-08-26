import { ANALYTICS_GROUP_BY } from "./analytics.constants";
import {
  getAnalyticsGroupByForRange,
  getAnalyticsRangeDayCount,
} from "./analytics.utils";

const defaultRange = {
  from: "2026-08-01",
  to: "2026-08-31",
};

const defaultComparisonRange = {
  from: "2026-07-01",
  to: "2026-07-31",
};

const toDay = (day) => String(day).padStart(2, "0");
const toDate = (month, day) => `2026-${month}-${toDay(day)}`;

const buildSalesRecords = (month, entries) =>
  entries.map(([day, netSales, salesCount, marginRate]) => ({
    periodStart: toDate(month, day),
    netSales,
    salesCount,
    grossProfit: Math.round(netSales * marginRate),
  }));

const salesRecords = [
  ...buildSalesRecords("05", [
    [3, 132000, 7, 0.24],
    [13, 185000, 9, 0.27],
    [14, 221000, 11, 0.28],
    [19, 174000, 8, 0.25],
    [24, 296000, 13, 0.29],
    [29, 244000, 10, 0.26],
  ]),
  ...buildSalesRecords("06", [
    [2, 198000, 9, 0.26],
    [5, 226000, 11, 0.27],
    [11, 317000, 15, 0.29],
    [16, 284000, 13, 0.28],
    [20, 351000, 16, 0.30],
    [25, 269000, 12, 0.27],
    [28, 308000, 14, 0.28],
  ]),
  ...buildSalesRecords("07", [
    [1, 228000, 10, 0.27],
    [3, 251000, 12, 0.28],
    [5, 306000, 14, 0.29],
    [8, 318000, 15, 0.28],
    [10, 337000, 16, 0.30],
    [13, 348000, 16, 0.27],
    [14, 362000, 17, 0.29],
    [16, 341000, 15, 0.30],
    [20, 347000, 16, 0.28],
    [21, 388000, 18, 0.30],
    [22, 413000, 19, 0.29],
    [24, 326000, 15, 0.28],
    [26, 305000, 14, 0.27],
    [27, 343000, 16, 0.29],
    [28, 391000, 18, 0.30],
    [29, 442000, 20, 0.31],
    [30, 387000, 18, 0.29],
    [31, 336000, 16, 0.28],
  ]),
  ...buildSalesRecords("08", [
    [1, 250000, 12, 0.29],
    [2, 272000, 13, 0.28],
    [4, 309000, 14, 0.30],
    [5, 336000, 16, 0.29],
    [7, 266000, 12, 0.28],
    [8, 352000, 16, 0.30],
    [9, 371000, 17, 0.31],
    [10, 318000, 15, 0.29],
    [13, 396000, 18, 0.31],
    [14, 418000, 19, 0.30],
    [15, 365000, 17, 0.29],
    [16, 338000, 15, 0.28],
    [19, 301000, 14, 0.29],
    [20, 389000, 18, 0.30],
    [21, 426000, 20, 0.31],
    [22, 455000, 21, 0.30],
    [25, 298000, 13, 0.28],
    [26, 332000, 15, 0.29],
    [27, 381000, 17, 0.30],
    [28, 447000, 20, 0.31],
    [29, 493000, 22, 0.32],
    [30, 421000, 19, 0.30],
    [31, 365000, 17, 0.29],
  ]),
].sort((a, b) => a.periodStart.localeCompare(b.periodStart));

const expenseRecords = [
  { periodStart: "2026-05-04", category: "Servicios", name: "Servicios", amount: 78000, paidAmount: 78000 },
  { periodStart: "2026-05-12", name: "Alquiler", amount: 185000, paidAmount: 185000 },
  { periodStart: "2026-05-21", name: "Insumos operativos", amount: 52000, paidAmount: 26000 },
  { periodStart: "2026-06-03", category: "Servicios", name: "Servicios", amount: 92000, paidAmount: 92000 },
  { periodStart: "2026-06-10", name: "Sueldos y honorarios", amount: 245000, paidAmount: 170000 },
  { periodStart: "2026-06-17", name: "Logistica", amount: 84000, paidAmount: 84000 },
  { periodStart: "2026-06-26", name: "Insumos operativos", amount: 61000, paidAmount: 30000 },
  { periodStart: "2026-07-02", category: "Servicios", name: "Servicios", amount: 118000, paidAmount: 118000 },
  { periodStart: "2026-07-08", name: "Alquiler", amount: 210000, paidAmount: 210000 },
  { periodStart: "2026-07-12", name: "Sueldos y honorarios", amount: 310000, paidAmount: 240000 },
  { periodStart: "2026-07-18", name: "Logistica", amount: 126000, paidAmount: 80000 },
  { periodStart: "2026-07-24", category: "Servicios", name: "Servicios", amount: 94000, paidAmount: 94000 },
  { periodStart: "2026-07-29", name: "Insumos operativos", amount: 76000, paidAmount: 38000 },
  { periodStart: "2026-08-01", category: "Servicios", name: "Internet oficina", amount: 46000, paidAmount: 46000 },
  { periodStart: "2026-08-05", category: "Servicios", name: "Abono de telefonia, conectividad, soporte tecnico del local principal y mantenimiento extendido de infraestructura de red corporativa", amount: 65000, paidAmount: 30000 },
  { periodStart: "2026-08-04", name: "Servicio mensual de mantenimiento preventivo y reparación general del establecimiento", amount: 128000, paidAmount: 128000 },
  { periodStart: "2026-08-07", name: "Logistica", amount: 62000, paidAmount: 62000 },
  { periodStart: "2026-08-10", name: "Sueldos y honorarios", amount: 174000, paidAmount: 120000 },
  { periodStart: "2026-08-14", name: "Insumos operativos", amount: 94000, paidAmount: 47000 },
  { periodStart: "2026-08-18", name: "Alquiler", amount: 156000, paidAmount: 156000 },
  { periodStart: "2026-08-22", category: "Servicios", name: "Servicios municipales pendientes de liquidacion", amount: 85000, paidAmount: 0 },
  { periodStart: "2026-08-26", name: "Sueldos y honorarios", amount: 218000, paidAmount: 85000 },
  { periodStart: "2026-08-30", name: "Alquiler", amount: 252000, paidAmount: 36000 },
].sort((a, b) => a.periodStart.localeCompare(b.periodStart));

const productCatalog = [
  {
    productId: "CECE93106",
    name: "Cetol Classic Brillante Natural 4 Lts.",
    brandName: "CETOL",
    supplierName: "CETOL",
    share: 0.21,
  },
  {
    productId: "SHER22011",
    name: "Sherwin Williams Loxon Exterior 20 Lts.",
    brandName: "SHERWIN",
    supplierName: "Sherwin Williams",
    share: 0.19,
  },
  {
    productId: "SIN91802",
    name: "Pintura látex premium interior y exterior lavable blanco mate balde de 20 litros",
    brandName: "SINTEPLAST",
    supplierName: "Sinteplast",
    share: 0.16,
  },
  {
    productId: "PLAV45077",
    name: "Plavicon Membrana Liquida Fibrada 20 Kg.",
    brandName: "PLAVICON",
    supplierName: "Plavicon",
    share: 0.13,
  },
  {
    productId: "ALBA12004",
    name: "Alba Latex Interior Mate 20 Lts.",
    brandName: "ALBA",
    supplierName: "Akzo Nobel",
    share: 0.11,
  },
];

const isInRange = (date, range) => date >= range.from && date <= range.to;
const ONE_DAY_MS = 86400000;

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const addDays = (date, days) => {
  const nextDate = new Date(`${date}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + days);

  return toIsoDate(nextDate);
};

const getPreviousRange = (range) => {
  const from = new Date(`${range.from}T00:00:00`);
  const to = new Date(`${range.to}T00:00:00`);
  const dayCount = Math.max(1, Math.round((to - from) / 86400000) + 1);
  const previousTo = new Date(from);
  previousTo.setDate(previousTo.getDate() - 1);
  const previousFrom = new Date(previousTo);
  previousFrom.setDate(previousFrom.getDate() - dayCount + 1);

  return {
    from: previousFrom.toISOString().slice(0, 10),
    to: previousTo.toISOString().slice(0, 10),
  };
};

const getSalesForRange = (range) => salesRecords.filter(({ periodStart }) => isInRange(periodStart, range));
const getExpensesForRange = (range) => expenseRecords.filter(({ periodStart }) => isInRange(periodStart, range));
const getExpenseCategory = (item) => item.category ?? item.name;
const mapExpenseDetail = (item) => ({
  id: `${item.periodStart}_${getExpenseCategory(item)}_${item.name}`,
  name: item.name,
  date: item.periodStart,
  amount: item.amount,
  paidAmount: item.paidAmount,
  pendingAmount: item.amount - item.paidAmount,
});
const salesByDate = salesRecords.reduce((result, item) => {
  result[item.periodStart] = item;
  return result;
}, {});

const buildDayBucket = ({ periodStart, netSales, salesCount, grossProfit }) => ({
  periodEnd: periodStart,
  periodLabel: periodStart,
  periodStart,
  netSales,
  salesCount,
  grossProfit,
});

const buildEmptyDayBucket = (periodStart) =>
  buildDayBucket({
    periodStart,
    netSales: 0,
    salesCount: 0,
    grossProfit: 0,
  });

const buildDailySalesBuckets = (range) => {
  const from = new Date(`${range.from}T00:00:00`);
  const to = new Date(`${range.to}T00:00:00`);
  const dayCount = Math.max(0, Math.round((to - from) / ONE_DAY_MS) + 1);

  return Array.from({ length: dayCount }, (_, index) => {
    const periodStart = addDays(range.from, index);
    const record = salesByDate[periodStart];

    return buildDayBucket({
      periodStart,
      netSales: record?.netSales ?? 0,
      salesCount: record?.salesCount ?? 0,
      grossProfit: record?.grossProfit ?? 0,
    });
  });
};

const buildEmptyDailySalesBuckets = (range) =>
  buildDailySalesBuckets(range).map(({ periodStart }) => buildEmptyDayBucket(periodStart));

const aggregateBuckets = (dailyBuckets, bucketRanges) =>
  bucketRanges.map(({ periodStart, periodEnd, periodLabel }) => {
    const items = dailyBuckets.filter((item) => isInRange(item.periodStart, { from: periodStart, to: periodEnd }));

    return {
      periodStart,
      periodEnd,
      periodLabel,
      netSales: sum(items, "netSales"),
      salesCount: sum(items, "salesCount"),
      grossProfit: sum(items, "grossProfit"),
    };
  });

const getWeekBucketRanges = (range) => {
  const dayCount = getAnalyticsRangeDayCount(range);
  const bucketCount = Math.ceil(dayCount / 7);

  return Array.from({ length: bucketCount }, (_, index) => {
    const periodStart = addDays(range.from, index * 7);
    const periodEnd = addDays(periodStart, Math.min(6, dayCount - (index * 7) - 1));

    return {
      periodStart,
      periodEnd,
      periodLabel: `${periodStart} - ${periodEnd}`,
    };
  });
};

const getMonthBucketRanges = (range) => {
  const ranges = [];
  let cursor = new Date(`${range.from}T00:00:00`);
  const lastDate = new Date(`${range.to}T00:00:00`);

  while (cursor <= lastDate) {
    const periodStart = toIsoDate(cursor);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const periodEnd = toIsoDate(monthEnd < lastDate ? monthEnd : lastDate);

    ranges.push({
      periodStart,
      periodEnd,
      periodLabel: periodStart,
    });

    cursor = new Date(`${periodEnd}T00:00:00`);
    cursor.setDate(cursor.getDate() + 1);
  }

  return ranges;
};

const getRelativeBucketRanges = (range, sourceBucketRanges) => {
  let cursor = range.from;

  return sourceBucketRanges.map(({ periodStart, periodEnd, periodLabel }) => {
    const dayCount = getAnalyticsRangeDayCount({ from: periodStart, to: periodEnd });
    const relativeStart = cursor;
    const relativeEnd = addDays(relativeStart, dayCount - 1);

    cursor = addDays(relativeEnd, 1);

    return {
      periodStart: relativeStart,
      periodEnd: relativeEnd,
      periodLabel,
    };
  });
};

const buildGroupedSalesBuckets = ({ range, previousRange, groupBy, empty = false }) => {
  const currentDaily = empty ? buildEmptyDailySalesBuckets(range) : buildDailySalesBuckets(range);
  const previousDaily = empty ? buildEmptyDailySalesBuckets(previousRange) : buildDailySalesBuckets(previousRange);
  const bucketRanges = groupBy === ANALYTICS_GROUP_BY.MONTH
    ? getMonthBucketRanges(range)
    : getWeekBucketRanges(range);
  const previousBucketRanges = getRelativeBucketRanges(previousRange, bucketRanges);

  return {
    current: aggregateBuckets(currentDaily, bucketRanges),
    previous: aggregateBuckets(previousDaily, previousBucketRanges),
  };
};

const buildEmptyGroupedSalesBuckets = (range, groupBy) =>
  buildGroupedSalesBuckets({
    range,
    previousRange: getPreviousRange(range),
    groupBy,
    empty: true,
  });

const sum = (items, field) => items.reduce((total, item) => total + Number(item[field] ?? 0), 0);
const changePct = (value, previousValue) => {
  if (!previousValue) return value ? 100 : 0;
  return Number((((value - previousValue) / previousValue) * 100).toFixed(2));
};

const summarizeSales = (items) => {
  const netSales = sum(items, "netSales");
  const salesCount = sum(items, "salesCount");
  const grossProfit = sum(items, "grossProfit");

  return {
    netSales,
    salesCount,
    averageTicket: salesCount ? Number((netSales / salesCount).toFixed(2)) : 0,
    grossProfit,
    grossMargin: netSales ? Number(((grossProfit / netSales) * 100).toFixed(2)) : 0,
  };
};

export const buildMockOverview = ({ range = defaultRange, comparisonRange = getPreviousRange(range) }) => {
  const currentSales = summarizeSales(getSalesForRange(range));
  const previousSales = summarizeSales(getSalesForRange(comparisonRange));
  const expenses = sum(getExpensesForRange(range), "amount");
  const previousExpenses = sum(getExpensesForRange(comparisonRange), "amount");

  return {
    range,
    comparisonRange,
    kpis: {
      netSales: {
        value: currentSales.netSales,
        previousValue: previousSales.netSales,
        changePct: changePct(currentSales.netSales, previousSales.netSales),
      },
      salesCount: {
        value: currentSales.salesCount,
        previousValue: previousSales.salesCount,
        changePct: changePct(currentSales.salesCount, previousSales.salesCount),
      },
      averageTicket: {
        value: currentSales.averageTicket,
        previousValue: previousSales.averageTicket,
        changePct: changePct(currentSales.averageTicket, previousSales.averageTicket),
      },
      grossProfit: {
        value: currentSales.grossProfit,
        previousValue: previousSales.grossProfit,
        changePct: changePct(currentSales.grossProfit, previousSales.grossProfit),
      },
      grossMargin: {
        value: currentSales.grossMargin,
        previousValue: previousSales.grossMargin,
        changePercentagePoints: Number((currentSales.grossMargin - previousSales.grossMargin).toFixed(2)),
      },
      expenses: {
        value: expenses,
        previousValue: previousExpenses,
        changePct: changePct(expenses, previousExpenses),
      },
    },
  };
};

export const buildMockSalesTimeseries = ({ range = defaultRange, groupBy } = {}) => {
  const resolvedGroupBy = groupBy ?? getAnalyticsGroupByForRange(range);
  const previousRange = getPreviousRange(range);

  if (resolvedGroupBy === ANALYTICS_GROUP_BY.DAY) {
    return {
      range,
      groupBy: resolvedGroupBy,
      current: buildDailySalesBuckets(range),
      previous: buildDailySalesBuckets(previousRange),
    };
  }

  const grouped = buildGroupedSalesBuckets({ range, previousRange, groupBy: resolvedGroupBy });

  return {
    range,
    groupBy: resolvedGroupBy,
    ...grouped,
  };
};

export const buildEmptyMockSalesTimeseries = ({ range = defaultRange, groupBy } = {}) => {
  const resolvedGroupBy = groupBy ?? getAnalyticsGroupByForRange(range);
  const previousRange = getPreviousRange(range);

  if (resolvedGroupBy === ANALYTICS_GROUP_BY.DAY) {
    return {
      range,
      groupBy: resolvedGroupBy,
      current: buildEmptyDailySalesBuckets(range),
      previous: buildEmptyDailySalesBuckets(previousRange),
    };
  }

  const grouped = buildEmptyGroupedSalesBuckets(range, resolvedGroupBy);

  return {
    range,
    groupBy: resolvedGroupBy,
    ...grouped,
  };
};

export const buildMockProducts = ({ range = defaultRange, sortBy = "revenue" } = {}) => {
  const totalRevenue = sum(getSalesForRange(range), "netSales");
  const items = totalRevenue
    ? productCatalog.map((product, index) => ({
      productId: product.productId,
      name: product.name,
      brandName: product.brandName,
      supplierName: product.supplierName,
      revenue: Math.round(totalRevenue * product.share),
      commercialQuantity: Math.max(1, Math.round((totalRevenue * product.share) / (18000 + (index * 1800)))),
    }))
    : [];

  return {
    range,
    sortBy,
    items: items.sort((a, b) => b.revenue - a.revenue),
  };
};

export const buildMockExpenses = ({ range = defaultRange } = {}) => {
  const records = getExpensesForRange(range);
  const total = sum(records, "amount");
  const paidAmount = sum(records, "paidAmount");
  const pendingAmount = total - paidAmount;
  const categoriesByName = records.reduce((result, item) => {
    const category = getExpenseCategory(item);
    result[category] = (result[category] ?? 0) + item.amount;
    return result;
  }, {});

  const categories = Object.entries(categoriesByName)
    .map(([name, amount]) => ({
      name,
      amount,
      sharePct: total ? Number(((amount / total) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const timeseriesByDate = records.reduce((result, item) => {
    result[item.periodStart] = (result[item.periodStart] ?? 0) + item.amount;
    return result;
  }, {});

  return {
    range,
    total,
    paidAmount,
    pendingAmount,
    categories,
    timeseries: Object.entries(timeseriesByDate).map(([periodStart, amount]) => ({ periodStart, amount })),
  };
};

export const buildMockExpenseCategoryDetails = ({ category, range = defaultRange } = {}) => {
  const items = category
    ? getExpensesForRange(range)
      .filter((item) => getExpenseCategory(item) === category)
      .map(mapExpenseDetail)
    : [];

  return {
    category,
    range,
    total: sum(items, "amount"),
    paidAmount: sum(items, "paidAmount"),
    pendingAmount: sum(items, "pendingAmount"),
    items,
  };
};

export const analyticsMockData = {
  overview: buildMockOverview({ range: defaultRange, comparisonRange: defaultComparisonRange }),
  salesTimeseries: buildMockSalesTimeseries({ range: defaultRange }),
  products: buildMockProducts({ range: defaultRange }),
  expenses: buildMockExpenses({ range: defaultRange }),
};

export const emptyAnalyticsMockData = {
  overview: {
    range: defaultRange,
    comparisonRange: defaultComparisonRange,
    kpis: {
      netSales: { value: 0, previousValue: 0, changePct: 0 },
      salesCount: { value: 0, previousValue: 0, changePct: 0 },
      averageTicket: { value: 0, previousValue: 0, changePct: 0 },
      grossProfit: { value: 0, previousValue: 0, changePct: 0 },
      grossMargin: { value: 0, previousValue: 0, changePercentagePoints: 0 },
      expenses: { value: 0, previousValue: 0, changePct: 0 },
    },
  },
  salesTimeseries: {
    range: defaultRange,
    groupBy: "day",
    current: buildEmptyDailySalesBuckets(defaultRange),
    previous: buildEmptyDailySalesBuckets(defaultComparisonRange),
  },
  products: {
    range: defaultRange,
    sortBy: "revenue",
    items: [],
  },
  expenses: {
    range: defaultRange,
    total: 0,
    paidAmount: 0,
    pendingAmount: 0,
    categories: [],
    timeseries: [],
  },
};
