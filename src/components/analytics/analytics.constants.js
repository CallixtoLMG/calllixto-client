export const ANALYTICS_QUERY_KEYS = {
  OVERVIEW: "analytics-overview",
  SALES_TIMESERIES: "analytics-sales-timeseries",
  TOP_PRODUCTS: "analytics-top-products",
  SALES_RANKING: "analytics-sales-ranking",
  EXPENSES: "analytics-expenses",
  EXPENSE_CATEGORY_DETAILS: "analytics-expense-category-details",
};

export const ANALYTICS_GROUP_BY = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
};

export const ANALYTICS_GRANULARITY_THRESHOLDS = {
  DAY_MAX_DAYS: 31,
  WEEK_MAX_DAYS: 120,
};

export const ANALYTICS_MOCK_STATES = {
  READY: "ready",
  LOADING: "loading",
  EMPTY: "empty",
  ERROR: "error",
  TOP_PRODUCTS_ERROR: "topProductsError",
  EXPENSES_ERROR: "expensesError",
  SALES_ERROR: "salesError",
  EXPENSE_CATEGORY_DETAILS_ERROR: "expenseCategoryDetailsError",
};

export const ANALYTICS_BUSINESS_TIMEZONE = "America/Argentina/Buenos_Aires";

export const ANALYTICS_PRESETS = {
  THIS_MONTH: "this-month",
  LAST_MONTH: "last-month",
  CUSTOM: "custom",
};

export const ANALYTICS_PRESET_OPTIONS = [
  { key: ANALYTICS_PRESETS.THIS_MONTH, text: "Este mes", value: ANALYTICS_PRESETS.THIS_MONTH },
  { key: ANALYTICS_PRESETS.LAST_MONTH, text: "Mes anterior", value: ANALYTICS_PRESETS.LAST_MONTH },
  { key: ANALYTICS_PRESETS.CUSTOM, text: "Personalizado", value: ANALYTICS_PRESETS.CUSTOM },
];

export const ANALYTICS_TABS = {
  SUMMARY: "summary",
  SALES: "sales",
  EXPENSES: "expenses",
};

export const ANALYTICS_TAB_OPTIONS = [
  { key: ANALYTICS_TABS.SUMMARY, label: "Resumen" },
  { key: ANALYTICS_TABS.SALES, label: "Ventas" },
  { key: ANALYTICS_TABS.EXPENSES, label: "Gastos" },
];

export const ANALYTICS_SALES_RANKING_DIMENSIONS = {
  PRODUCTS: "products",
  BRANDS: "brands",
  SUPPLIERS: "suppliers",
};

export const ANALYTICS_SALES_RANKING_OPTIONS = [
  { key: ANALYTICS_SALES_RANKING_DIMENSIONS.PRODUCTS, label: "Productos" },
  { key: ANALYTICS_SALES_RANKING_DIMENSIONS.BRANDS, label: "Marcas" },
  { key: ANALYTICS_SALES_RANKING_DIMENSIONS.SUPPLIERS, label: "Proveedores" },
];

export const ANALYTICS_SALES_KPI_KEYS = [
  "netSales",
  "salesCount",
  "averageTicket",
  "grossProfit",
  "grossMargin",
];

export const ANALYTICS_SUMMARY_KPI_KEYS = [
  "netSales",
  "grossProfit",
  "netExpense",
];

export const ANALYTICS_EXPENSE_KPI_KEYS = [
  "netExpense",
  "paidAmount",
  "pendingAmount",
];

export const ANALYTICS_MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const ANALYTICS_SHORT_MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export const SALES_CHART_CONFIG = {
  width: 1000,
  height: 320,
  padding: { top: 22, right: 24, bottom: 42, left: 76 },
  gridValues: [0.25, 0.5, 0.75, 1],
};

export const ANALYTICS_GROUP_BY_LABELS = {
  [ANALYTICS_GROUP_BY.DAY]: "Diario",
  [ANALYTICS_GROUP_BY.WEEK]: "Semanal",
  [ANALYTICS_GROUP_BY.MONTH]: "Mensual",
};

export const ANALYTICS_KPI_FORMATS = {
  PRICE: "price",
  NUMBER: "number",
  PERCENT: "percent",
};

export const ANALYTICS_KPI_CONFIG = [
  {
    key: "netSales",
    label: "Ventas netas",
    tooltip: "Importe total vendido en el período seleccionado.",
    formatKey: ANALYTICS_KPI_FORMATS.PRICE,
    changeKey: "changePct",
    previousLabel: "período anterior",
    higherIsPositive: true,
  },
  {
    key: "salesCount",
    label: "Cantidad de ventas",
    tooltip: "Número de ventas registradas en el período.",
    formatKey: ANALYTICS_KPI_FORMATS.NUMBER,
    changeKey: "changePct",
    previousLabel: "ventas previas",
    higherIsPositive: true,
  },
  {
    key: "averageTicket",
    label: "Ticket promedio",
    tooltip: "Importe promedio por cada venta del período.",
    formatKey: ANALYTICS_KPI_FORMATS.PRICE,
    changeKey: "changePct",
    previousLabel: "ticket previo",
    higherIsPositive: true,
  },
  {
    key: "grossProfit",
    label: "Margen bruto",
    tooltip: "Ventas menos el costo histórico de los productos vendidos.",
    formatKey: ANALYTICS_KPI_FORMATS.PRICE,
    changeKey: "changePct",
    previousLabel: "margen previo",
    higherIsPositive: true,
  },
  {
    key: "grossMargin",
    label: "Margen bruto %",
    tooltip: "Porcentaje de las ventas que queda luego del costo de los productos.",
    formatKey: ANALYTICS_KPI_FORMATS.PERCENT,
    changeKey: "changePercentagePoints",
    previousLabel: "Período anterior:",
    previousLabelPosition: "prefix",
    higherIsPositive: true,
    isPercentagePoints: true,
  },
  {
    key: "expenses",
    label: "Gastos",
    tooltip: "Total de gastos registrados, estén pagados o pendientes.",
    formatKey: ANALYTICS_KPI_FORMATS.PRICE,
    changeKey: "changePct",
    previousLabel: "gasto previo",
    higherIsPositive: false,
  },
  {
    key: "netExpense",
    label: "Gasto neto",
    tooltip: "Gastos registrados en el período menos anulaciones registradas en el período.",
    formatKey: ANALYTICS_KPI_FORMATS.PRICE,
    changeKey: "changePct",
    previousLabel: "gasto neto previo",
    higherIsPositive: false,
  },
  {
    key: "paidAmount",
    label: "Pagado",
    tooltip: "Pagos registrados hasta el corte del período para los gastos del período.",
    formatKey: ANALYTICS_KPI_FORMATS.PRICE,
    changeKey: "changePct",
    previousLabel: "pagado previo",
    higherIsPositive: true,
  },
  {
    key: "pendingAmount",
    label: "Pendiente",
    tooltip: "Saldo pendiente al corte histórico del período para los gastos del período.",
    formatKey: ANALYTICS_KPI_FORMATS.PRICE,
    changeKey: "changePct",
    previousLabel: "pendiente previo",
    higherIsPositive: false,
  },
];
