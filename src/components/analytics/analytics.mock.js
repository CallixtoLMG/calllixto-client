import {
  ANALYTICS_GROUP_BY,
  ANALYTICS_SALES_RANKING_DIMENSIONS,
} from "./analytics.constants";
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

const COST_MODES = {
  KNOWN: "known",
  PARTIAL: "partial",
  ZERO: "zero",
  NULL: "null",
  MISSING: "missing",
};

const buildSaleLines = ({ revenue, marginRate, costMode = COST_MODES.KNOWN }) => {
  if (costMode === COST_MODES.ZERO) {
    return [{ revenue, cost: 0 }];
  }

  if (costMode === COST_MODES.NULL) {
    return [{ revenue, cost: null }];
  }

  if (costMode === COST_MODES.MISSING) {
    return [{ revenue }];
  }

  if (costMode === COST_MODES.PARTIAL) {
    const knownRevenue = Math.round(revenue * 0.6);
    const unknownRevenue = revenue - knownRevenue;

    return [
      {
        revenue: knownRevenue,
        cost: Math.round(knownRevenue * (1 - marginRate)),
      },
      {
        revenue: unknownRevenue,
        cost: null,
      },
    ];
  }

  return [{
    revenue,
    cost: Math.round(revenue * (1 - marginRate)),
  }];
};

const buildSalesRecords = (month, entries) =>
  entries.map(([day, revenue, salesCount, marginRate, options = {}], index) => ({
    saleId: `sale-2026-${month}-${toDay(day)}-${index}`,
    confirmedAt: toDate(month, day),
    periodStart: toDate(month, day),
    revenue,
    salesCount,
    lines: buildSaleLines({
      revenue,
      marginRate,
      costMode: options.costMode,
    }),
    ...(options.cancelledAt ? {
      cancelledAt: options.cancelledAt,
      cancelledRevenue: options.cancelledRevenue ?? revenue,
    } : {}),
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
    [20, 389000, 18, 0.30, { cancelledAt: "2026-09-05" }],
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
  ...buildSalesRecords("09", [
    [10, 120000, 6, 0.30, { costMode: COST_MODES.PARTIAL }],
    [12, 50000, 2, 1, { costMode: COST_MODES.ZERO }],
  ]),
  ...buildSalesRecords("10", [
    [1, 90000, 4, 0.30, { costMode: COST_MODES.NULL }],
    [2, 70000, 3, 0.30, { costMode: COST_MODES.MISSING }],
  ]),
].sort((a, b) => a.confirmedAt.localeCompare(b.confirmedAt));

const EXPENSE_STATES = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
};

const EXPENSE_CATEGORIES = {
  RENT: { name: "Alquiler", color: "blue", description: "Gastos de alquiler." },
  MAINTENANCE: { name: "Mantenimiento", color: "teal", description: "Mantenimiento del establecimiento." },
  OPERATIONS: { name: "Insumos operativos", color: "orange", description: "Insumos de operacion." },
  LOGISTICS: { name: "Logistica", color: "purple", description: "Envios y traslados." },
  PAYROLL: { name: "Sueldos y honorarios", color: "green", description: "Equipo y servicios profesionales." },
  SERVICES: { name: "Servicios", color: "yellow", description: "Servicios recurrentes." },
};

const createPaymentHistory = (payments = []) =>
  payments.reduce((result, [date, amount, method = "transferencia"], index) => {
    const id = `payment-${date.replaceAll("-", "")}-${index + 1}`;

    result[id] = {
      id,
      date,
      amount,
      method,
    };

    return result;
  }, {});

const getExpensePayments = (expense) => Object.values(expense.paymentHistory ?? {});

const createExpenseRecord = ({
  amount,
  cancelledAt,
  categories,
  createdAt,
  expirationDate,
  name,
  payments = [],
  primaryCategory,
  state,
}) => {
  const paymentHistory = createPaymentHistory(payments);
  const paidAmount = getExpensePayments({ paymentHistory }).reduce((total, payment) => total + payment.amount, 0);

  return {
    id: `expense-${createdAt}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    amount,
    categories,
    createdAt,
    expirationDate: expirationDate ?? createdAt,
    name,
    paidAmount,
    paymentHistory,
    primaryCategory,
    state: state ?? (cancelledAt ? EXPENSE_STATES.CANCELLED : (paidAmount >= amount ? EXPENSE_STATES.PAID : EXPENSE_STATES.PENDING)),
    ...(cancelledAt ? { cancelledAt } : {}),
  };
};

const expenseRecords = [
  createExpenseRecord({ createdAt: "2026-05-04", name: "Servicios", amount: 78000, payments: [["2026-05-05", 78000]], primaryCategory: EXPENSE_CATEGORIES.SERVICES, categories: [EXPENSE_CATEGORIES.SERVICES] }),
  createExpenseRecord({ createdAt: "2026-05-12", name: "Alquiler", amount: 185000, payments: [["2026-05-12", 185000]], primaryCategory: EXPENSE_CATEGORIES.RENT, categories: [EXPENSE_CATEGORIES.RENT] }),
  createExpenseRecord({ createdAt: "2026-05-21", name: "Insumos operativos", amount: 52000, payments: [["2026-05-28", 26000]], primaryCategory: EXPENSE_CATEGORIES.OPERATIONS, categories: [EXPENSE_CATEGORIES.OPERATIONS] }),
  createExpenseRecord({ createdAt: "2026-06-03", name: "Servicios", amount: 92000, payments: [["2026-06-03", 92000]], primaryCategory: EXPENSE_CATEGORIES.SERVICES, categories: [EXPENSE_CATEGORIES.SERVICES] }),
  createExpenseRecord({ createdAt: "2026-06-10", name: "Sueldos y honorarios", amount: 245000, payments: [["2026-06-15", 170000]], primaryCategory: EXPENSE_CATEGORIES.PAYROLL, categories: [EXPENSE_CATEGORIES.PAYROLL] }),
  createExpenseRecord({ createdAt: "2026-06-17", name: "Logistica", amount: 84000, payments: [["2026-06-17", 84000]], primaryCategory: EXPENSE_CATEGORIES.LOGISTICS, categories: [EXPENSE_CATEGORIES.LOGISTICS] }),
  createExpenseRecord({ createdAt: "2026-06-26", name: "Insumos operativos", amount: 61000, payments: [["2026-06-30", 30000]], primaryCategory: EXPENSE_CATEGORIES.OPERATIONS, categories: [EXPENSE_CATEGORIES.OPERATIONS] }),
  createExpenseRecord({ createdAt: "2026-07-02", name: "Servicios", amount: 118000, payments: [["2026-07-02", 118000]], primaryCategory: EXPENSE_CATEGORIES.SERVICES, categories: [EXPENSE_CATEGORIES.SERVICES] }),
  createExpenseRecord({ createdAt: "2026-07-08", name: "Alquiler", amount: 210000, payments: [["2026-07-08", 210000]], primaryCategory: EXPENSE_CATEGORIES.RENT, categories: [EXPENSE_CATEGORIES.RENT] }),
  createExpenseRecord({ createdAt: "2026-07-12", name: "Sueldos y honorarios", amount: 310000, payments: [["2026-07-20", 240000]], primaryCategory: EXPENSE_CATEGORIES.PAYROLL, categories: [EXPENSE_CATEGORIES.PAYROLL] }),
  createExpenseRecord({ createdAt: "2026-07-18", name: "Logistica", amount: 126000, payments: [["2026-07-25", 80000]], primaryCategory: EXPENSE_CATEGORIES.LOGISTICS, categories: [EXPENSE_CATEGORIES.LOGISTICS] }),
  createExpenseRecord({ createdAt: "2026-07-24", name: "Servicios", amount: 94000, payments: [["2026-07-24", 94000]], primaryCategory: EXPENSE_CATEGORIES.SERVICES, categories: [EXPENSE_CATEGORIES.SERVICES] }),
  createExpenseRecord({ createdAt: "2026-07-29", name: "Insumos operativos", amount: 76000, payments: [["2026-07-31", 38000]], primaryCategory: EXPENSE_CATEGORIES.OPERATIONS, categories: [EXPENSE_CATEGORIES.OPERATIONS] }),
  createExpenseRecord({ createdAt: "2026-08-01", name: "Internet oficina", amount: 46000, payments: [["2026-08-01", 46000]], primaryCategory: EXPENSE_CATEGORIES.SERVICES, categories: [EXPENSE_CATEGORIES.SERVICES] }),
  createExpenseRecord({ createdAt: "2026-08-05", name: "Abono de telefonia, conectividad, soporte tecnico del local principal y mantenimiento extendido de infraestructura de red corporativa", amount: 65000, payments: [["2026-08-10", 30000]], primaryCategory: EXPENSE_CATEGORIES.SERVICES, categories: [EXPENSE_CATEGORIES.SERVICES] }),
  createExpenseRecord({ createdAt: "2026-08-04", name: "Servicio mensual de mantenimiento preventivo y reparación general del establecimiento", amount: 128000, payments: [["2026-08-04", 128000]], primaryCategory: EXPENSE_CATEGORIES.MAINTENANCE, categories: [EXPENSE_CATEGORIES.SERVICES, EXPENSE_CATEGORIES.MAINTENANCE] }),
  createExpenseRecord({ createdAt: "2026-08-07", name: "Logistica", amount: 62000, payments: [["2026-08-07", 62000]], categories: [EXPENSE_CATEGORIES.LOGISTICS] }),
  createExpenseRecord({ createdAt: "2026-08-10", name: "Sueldos y honorarios", amount: 174000, payments: [["2026-08-15", 120000]], primaryCategory: EXPENSE_CATEGORIES.PAYROLL, categories: [EXPENSE_CATEGORIES.PAYROLL] }),
  createExpenseRecord({ createdAt: "2026-08-14", name: "Insumos operativos", amount: 94000, payments: [["2026-08-21", 47000]], primaryCategory: EXPENSE_CATEGORIES.OPERATIONS, categories: [EXPENSE_CATEGORIES.OPERATIONS] }),
  createExpenseRecord({ createdAt: "2026-08-18", name: "Alquiler", amount: 156000, payments: [["2026-08-18", 156000]], primaryCategory: EXPENSE_CATEGORIES.RENT, categories: [EXPENSE_CATEGORIES.RENT] }),
  createExpenseRecord({ createdAt: "2026-08-22", name: "Servicios municipales pendientes de liquidacion", amount: 85000, primaryCategory: EXPENSE_CATEGORIES.SERVICES, categories: [EXPENSE_CATEGORIES.SERVICES] }),
  createExpenseRecord({ createdAt: "2026-08-26", name: "Sueldos y honorarios", amount: 218000, payments: [["2026-08-31", 85000]], primaryCategory: EXPENSE_CATEGORIES.PAYROLL, categories: [EXPENSE_CATEGORIES.PAYROLL] }),
  createExpenseRecord({ createdAt: "2026-08-29", name: "Seguro integral del local", amount: 49000, payments: [["2026-09-03", 49000]], primaryCategory: EXPENSE_CATEGORIES.RENT, categories: [EXPENSE_CATEGORIES.RENT] }),
  createExpenseRecord({ createdAt: "2026-08-30", name: "Alquiler deposito auxiliar", amount: 203000, payments: [["2026-08-31", 36000]], cancelledAt: "2026-09-05", primaryCategory: EXPENSE_CATEGORIES.RENT, categories: [EXPENSE_CATEGORIES.RENT] }),
  createExpenseRecord({ createdAt: "2026-09-10", name: "Reparacion menor de mostrador", amount: 58000, payments: [["2026-09-11", 12000], ["2026-09-12", 16000]], primaryCategory: EXPENSE_CATEGORIES.MAINTENANCE, categories: [EXPENSE_CATEGORIES.MAINTENANCE] }),
].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export const analyticsExpenseMockRecords = expenseRecords;

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
  {
    productId: "GEN00018",
    name: "Rodillo profesional microfibra alta densidad 22 cm",
    share: 0.07,
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

const getConfirmedSalesForRange = (range) => salesRecords.filter(({ confirmedAt }) => isInRange(confirmedAt, range));
const getCancellationEventsForRange = (range) => salesRecords.filter(({ cancelledAt }) => cancelledAt && isInRange(cancelledAt, range));
const getExpensesForRange = (range) => expenseRecords.filter(({ createdAt }) => isInRange(createdAt, range));
const getExpenseCancellationEventsForRange = (range) => expenseRecords.filter(({ cancelledAt }) => cancelledAt && isInRange(cancelledAt, range));
const getExpensePrimaryCategory = (item) => item.primaryCategory?.name ?? "Sin categoría principal";
const getPaidAmountAtCutoff = (item, cutoffDate) =>
  sum(getExpensePayments(item).filter(({ date }) => date <= cutoffDate), "amount");
const getExpenseStateAtCutoff = (item, cutoffDate) => {
  if (item.cancelledAt && item.cancelledAt <= cutoffDate) return EXPENSE_STATES.CANCELLED;
  return getPaidAmountAtCutoff(item, cutoffDate) >= item.amount
    ? EXPENSE_STATES.PAID
    : EXPENSE_STATES.PENDING;
};
const expenseStateLabels = {
  [EXPENSE_STATES.CANCELLED]: "Anulado",
  [EXPENSE_STATES.PAID]: "Pagado",
  [EXPENSE_STATES.PENDING]: "Pendiente",
};
const mapExpenseDetail = (item, range) => {
  const paidAmount = getPaidAmountAtCutoff(item, range.to);
  const state = getExpenseStateAtCutoff(item, range.to);

  return {
    id: `${item.createdAt}_${getExpensePrimaryCategory(item)}_${item.name}`,
    name: item.name,
    date: item.createdAt,
    amount: item.amount,
    paidAmount,
    pendingAmount: Math.max(item.amount - paidAmount, 0),
    state,
    stateLabel: expenseStateLabels[state],
  };
};
const mapExpenseCancellationDetail = (item) => ({
  id: `${item.cancelledAt}_${getExpensePrimaryCategory(item)}_${item.name}_cancelled`,
  name: item.name,
  date: item.cancelledAt,
  amount: -item.amount,
  paidAmount: 0,
  pendingAmount: 0,
  state: EXPENSE_STATES.CANCELLED,
  stateLabel: expenseStateLabels[EXPENSE_STATES.CANCELLED],
});
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
    const dailySummary = summarizeSales({ from: periodStart, to: periodStart });

    return buildDayBucket({
      periodStart,
      netSales: dailySummary.netSales,
      salesCount: dailySummary.salesCount,
      grossProfit: dailySummary.grossProfit ?? 0,
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
const isKnownCost = (line) => line.cost !== null && line.cost !== undefined;
const changePct = (value, previousValue) => {
  if (!previousValue) return value ? 100 : 0;
  return Number((((value - previousValue) / previousValue) * 100).toFixed(2));
};

const summarizeMargin = (confirmedSales) =>
  confirmedSales.reduce((result, sale) => {
    sale.lines.forEach((line) => {
      if (!isKnownCost(line)) {
        result.revenueWithoutKnownCost += line.revenue;
        return;
      }

      result.revenueWithKnownCost += line.revenue;
      result.grossProfit += line.revenue - line.cost;
    });

    return result;
  }, {
    grossProfit: 0,
    revenueWithKnownCost: 0,
    revenueWithoutKnownCost: 0,
  });

const buildMarginCoverage = ({ revenueWithKnownCost, revenueWithoutKnownCost }) => {
  const totalRevenue = revenueWithKnownCost + revenueWithoutKnownCost;

  return {
    revenueWithKnownCost,
    revenueWithoutKnownCost,
    percentage: totalRevenue ? Number(((revenueWithKnownCost / totalRevenue) * 100).toFixed(2)) : 0,
  };
};

const getMarginTooltip = (coverage) => {
  if (coverage.percentage === 0) {
    return "No hay costos informados para calcular el margen de este período.";
  }

  if (coverage.percentage < 100) {
    return `El margen fue calculado sobre el ${coverage.percentage}% de las ventas que tienen costo informado.`;
  }

  return null;
};

const buildMarginMetric = ({ value, previousValue, coverage, isPercentagePoints = false }) => {
  const hasKnownCost = coverage.revenueWithKnownCost > 0;
  const marginTooltip = getMarginTooltip(coverage);

  return {
    value: hasKnownCost ? value : null,
    previousValue: hasKnownCost ? previousValue : null,
    isAvailable: hasKnownCost,
    marginCoverage: coverage,
    ...(marginTooltip ? { tooltip: marginTooltip, hasWarning: coverage.percentage > 0 } : {}),
    ...(isPercentagePoints
      ? { changePercentagePoints: hasKnownCost ? Number((value - previousValue).toFixed(2)) : 0 }
      : { changePct: hasKnownCost ? changePct(value, previousValue) : 0 }),
  };
};

const summarizeSales = (range) => {
  const confirmedSales = getConfirmedSalesForRange(range);
  const cancellationEvents = getCancellationEventsForRange(range);
  const confirmedRevenue = sum(confirmedSales, "revenue");
  const cancellationsRevenue = sum(cancellationEvents, "cancelledRevenue");
  const netSales = confirmedRevenue - cancellationsRevenue;
  const salesCount = sum(confirmedSales, "salesCount");
  const margin = summarizeMargin(confirmedSales);
  const marginCoverage = buildMarginCoverage(margin);

  return {
    confirmedRevenue,
    cancellationsRevenue,
    netSales,
    salesCount,
    averageTicket: salesCount ? Number((netSales / salesCount).toFixed(2)) : 0,
    grossProfit: marginCoverage.revenueWithKnownCost ? margin.grossProfit : null,
    grossMargin: marginCoverage.revenueWithKnownCost
      ? Number(((margin.grossProfit / marginCoverage.revenueWithKnownCost) * 100).toFixed(2))
      : null,
    marginCoverage,
  };
};

const summarizeExpenses = (range) => {
  const registeredExpenses = getExpensesForRange(range);
  const cancellationEvents = getExpenseCancellationEventsForRange(range);
  const registeredAmount = sum(registeredExpenses, "amount");
  const cancellationsAmount = sum(cancellationEvents, "amount");
  const netExpense = registeredAmount - cancellationsAmount;
  const paidAmount = registeredExpenses.reduce((total, item) =>
    total + getPaidAmountAtCutoff(item, range.to), 0);
  const pendingAmount = registeredExpenses.reduce((total, item) =>
    total + Math.max(item.amount - getPaidAmountAtCutoff(item, range.to), 0), 0);

  return {
    registeredAmount,
    cancellationsAmount,
    netExpense,
    paidAmount,
    pendingAmount,
  };
};

export const buildMockOverview = ({ range = defaultRange, comparisonRange = getPreviousRange(range) }) => {
  const currentSales = summarizeSales(range);
  const previousSales = summarizeSales(comparisonRange);
  const expenses = summarizeExpenses(range);
  const previousExpenses = summarizeExpenses(comparisonRange);

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
        ...buildMarginMetric({
          value: currentSales.grossProfit,
          previousValue: previousSales.grossProfit,
          coverage: currentSales.marginCoverage,
        }),
      },
      grossMargin: {
        ...buildMarginMetric({
          value: currentSales.grossMargin,
          previousValue: previousSales.grossMargin,
          coverage: currentSales.marginCoverage,
          isPercentagePoints: true,
        }),
      },
      expenses: {
        value: expenses.netExpense,
        previousValue: previousExpenses.netExpense,
        changePct: changePct(expenses.netExpense, previousExpenses.netExpense),
      },
      netExpense: {
        value: expenses.netExpense,
        previousValue: previousExpenses.netExpense,
        changePct: changePct(expenses.netExpense, previousExpenses.netExpense),
      },
    },
    salesComposition: {
      confirmedSales: currentSales.confirmedRevenue,
      cancellations: currentSales.cancellationsRevenue,
      netSales: currentSales.netSales,
    },
    marginCoverage: currentSales.marginCoverage,
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

const buildProductRevenueItems = (range) => {
  const totalRevenue = sum(getConfirmedSalesForRange(range), "revenue");

  return totalRevenue
    ? productCatalog.map((product, index) => ({
      productId: product.productId,
      name: product.name,
      brandName: product.brandName ?? "Sin marca",
      supplierName: product.supplierName ?? "Sin proveedor",
      revenue: Math.round(totalRevenue * product.share),
      commercialQuantity: Math.max(1, Math.round((totalRevenue * product.share) / (18000 + (index * 1800)))),
    }))
    : [];
};

const aggregateRankingBy = (items, key, fallbackLabel) => {
  const byName = items.reduce((result, item) => {
    const name = item[key] || fallbackLabel;
    result[name] = (result[name] ?? 0) + item.revenue;
    return result;
  }, {});

  return Object.entries(byName)
    .map(([name, revenue]) => ({
      id: name,
      name,
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);
};

export const buildMockProducts = ({ range = defaultRange, sortBy = "revenue" } = {}) => {
  const items = buildProductRevenueItems(range);

  return {
    range,
    sortBy,
    items: items.sort((a, b) => b.revenue - a.revenue),
  };
};

export const buildMockSalesRanking = ({ range = defaultRange, dimension = ANALYTICS_SALES_RANKING_DIMENSIONS.PRODUCTS } = {}) => {
  const productItems = buildProductRevenueItems(range).sort((a, b) => b.revenue - a.revenue);
  const dimensionBuilders = {
    [ANALYTICS_SALES_RANKING_DIMENSIONS.PRODUCTS]: () => productItems,
    [ANALYTICS_SALES_RANKING_DIMENSIONS.BRANDS]: () => aggregateRankingBy(productItems, "brandName", "Sin marca"),
    [ANALYTICS_SALES_RANKING_DIMENSIONS.SUPPLIERS]: () => aggregateRankingBy(productItems, "supplierName", "Sin proveedor"),
  };

  return {
    range,
    dimension,
    items: (dimensionBuilders[dimension] ?? dimensionBuilders[ANALYTICS_SALES_RANKING_DIMENSIONS.PRODUCTS])(),
  };
};

const buildExpenseDayBucket = (periodStart) => {
  const summary = summarizeExpenses({ from: periodStart, to: periodStart });

  return {
    periodEnd: periodStart,
    periodLabel: periodStart,
    periodStart,
    registeredAmount: summary.registeredAmount,
    cancellationsAmount: summary.cancellationsAmount,
    netExpense: summary.netExpense,
  };
};

const buildDailyExpenseBuckets = (range) => {
  const dayCount = getAnalyticsRangeDayCount(range);

  return Array.from({ length: dayCount }, (_, index) =>
    buildExpenseDayBucket(addDays(range.from, index)));
};

const aggregateExpenseBuckets = (dailyBuckets, bucketRanges) =>
  bucketRanges.map(({ periodStart, periodEnd, periodLabel }) => {
    const items = dailyBuckets.filter((item) => isInRange(item.periodStart, { from: periodStart, to: periodEnd }));
    const registeredAmount = sum(items, "registeredAmount");
    const cancellationsAmount = sum(items, "cancellationsAmount");

    return {
      periodStart,
      periodEnd,
      periodLabel,
      registeredAmount,
      cancellationsAmount,
      netExpense: registeredAmount - cancellationsAmount,
    };
  });

const buildExpenseTimeseries = ({ range, groupBy }) => {
  const resolvedGroupBy = groupBy ?? getAnalyticsGroupByForRange(range);
  const dailyBuckets = buildDailyExpenseBuckets(range);

  if (resolvedGroupBy === ANALYTICS_GROUP_BY.DAY) return dailyBuckets;

  const bucketRanges = resolvedGroupBy === ANALYTICS_GROUP_BY.MONTH
    ? getMonthBucketRanges(range)
    : getWeekBucketRanges(range);

  return aggregateExpenseBuckets(dailyBuckets, bucketRanges);
};

export const buildMockExpenses = ({ range = defaultRange } = {}) => {
  const records = getExpensesForRange(range);
  const cancellations = getExpenseCancellationEventsForRange(range);
  const previousRange = getPreviousRange(range);
  const currentSummary = summarizeExpenses(range);
  const previousSummary = summarizeExpenses(previousRange);
  const categoriesByName = records.reduce((result, item) => {
    const category = getExpensePrimaryCategory(item);
    result[category] = (result[category] ?? 0) + item.amount;
    return result;
  }, {});

  cancellations.forEach((item) => {
    const category = getExpensePrimaryCategory(item);
    categoriesByName[category] = (categoriesByName[category] ?? 0) - item.amount;
  });

  const categories = Object.entries(categoriesByName)
    .map(([name, amount]) => ({
      name,
      amount,
      sharePct: currentSummary.netExpense ? Number(((amount / currentSummary.netExpense) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    range,
    previousRange,
    total: currentSummary.netExpense,
    registeredAmount: currentSummary.registeredAmount,
    cancellationsAmount: currentSummary.cancellationsAmount,
    netExpense: currentSummary.netExpense,
    paidAmount: currentSummary.paidAmount,
    pendingAmount: currentSummary.pendingAmount,
    kpis: {
      netExpense: {
        value: currentSummary.netExpense,
        previousValue: previousSummary.netExpense,
        changePct: changePct(currentSummary.netExpense, previousSummary.netExpense),
      },
      paidAmount: {
        value: currentSummary.paidAmount,
        previousValue: previousSummary.paidAmount,
        changePct: changePct(currentSummary.paidAmount, previousSummary.paidAmount),
      },
      pendingAmount: {
        value: currentSummary.pendingAmount,
        previousValue: previousSummary.pendingAmount,
        changePct: changePct(currentSummary.pendingAmount, previousSummary.pendingAmount),
      },
    },
    composition: {
      registeredAmount: currentSummary.registeredAmount,
      cancellationsAmount: currentSummary.cancellationsAmount,
      netExpense: currentSummary.netExpense,
    },
    categories,
    groupBy: getAnalyticsGroupByForRange(range),
    timeseries: buildExpenseTimeseries({ range }),
  };
};

export const buildMockExpenseCategoryDetails = ({ category, range = defaultRange } = {}) => {
  const registeredItems = category
    ? getExpensesForRange(range)
      .filter((item) => getExpensePrimaryCategory(item) === category)
      .map((item) => mapExpenseDetail(item, range))
    : [];
  const cancellationItems = category
    ? getExpenseCancellationEventsForRange(range)
      .filter((item) => getExpensePrimaryCategory(item) === category)
      .map(mapExpenseCancellationDetail)
    : [];
  const items = [...registeredItems, ...cancellationItems]
    .sort((a, b) => a.date.localeCompare(b.date));

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
  salesRanking: buildMockSalesRanking({ range: defaultRange }),
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
      grossProfit: {
        value: null,
        previousValue: null,
        changePct: 0,
        isAvailable: false,
        tooltip: "No hay costos informados para calcular el margen de este período.",
      },
      grossMargin: {
        value: null,
        previousValue: null,
        changePercentagePoints: 0,
        isAvailable: false,
        tooltip: "No hay costos informados para calcular el margen de este período.",
      },
      expenses: { value: 0, previousValue: 0, changePct: 0 },
      netExpense: { value: 0, previousValue: 0, changePct: 0 },
    },
    salesComposition: {
      confirmedSales: 0,
      cancellations: 0,
      netSales: 0,
    },
    marginCoverage: {
      revenueWithKnownCost: 0,
      revenueWithoutKnownCost: 0,
      percentage: 0,
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
  salesRanking: {
    range: defaultRange,
    dimension: ANALYTICS_SALES_RANKING_DIMENSIONS.PRODUCTS,
    items: [],
  },
  expenses: {
    range: defaultRange,
    previousRange: defaultComparisonRange,
    total: 0,
    registeredAmount: 0,
    cancellationsAmount: 0,
    netExpense: 0,
    paidAmount: 0,
    pendingAmount: 0,
    kpis: {
      netExpense: { value: 0, previousValue: 0, changePct: 0 },
      paidAmount: { value: 0, previousValue: 0, changePct: 0 },
      pendingAmount: { value: 0, previousValue: 0, changePct: 0 },
    },
    composition: {
      registeredAmount: 0,
      cancellationsAmount: 0,
      netExpense: 0,
    },
    categories: [],
    groupBy: "day",
    timeseries: buildDailyExpenseBuckets(defaultRange).map((bucket) => ({
      ...bucket,
      registeredAmount: 0,
      cancellationsAmount: 0,
      netExpense: 0,
    })),
  },
};
