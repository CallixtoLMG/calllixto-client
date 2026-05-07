import { formatCount, PLURAL_LABELS } from "@/common/utils/pluralization";

export const LIST_SETTINGS_QUERY_KEY = "listSettings";
export const GET_SETTING_QUERY_KEY = "getSetting";

export const BUDGETS_RANGE_DATE_UNIT_OPTIONS = [
  { key: "day", value: "day", text: "Días" },
  { key: "week", value: "week", text: "Semanas" },
  { key: "month", value: "month", text: "Meses" },
];

export const BASE_HISTORY_RANGES = [
  { key: "BASE_TODAY", label: "Hoy" },
  { key: "BASE_WEEK", label: "Esta semana" },
  { key: "BASE_MONTH", label: "Este mes" },
  { key: "BASE_YEAR", label: "Este año" },
];

export const BUDGETS_RANGE_DATE_UNIT_CONFIG = {
  day: {
    max: 31,
    ...PLURAL_LABELS.day,
  },
  week: {
    max: 7,
    ...PLURAL_LABELS.week,
  },
  month: {
    max: 12,
    ...PLURAL_LABELS.month,
  },
};

export const BUDGET_RANGE_DATE_MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const value = i + 1;
  return {
    key: value,
    value,
    text: formatCount(value, "month"),
  };
});

export const ENTITY_MAPPER = {
  PRODUCT: { name: "Productos" },
  CUSTOMER: { name: "Clientes" },
  BRAND: { name: "Marcas" },
  BUDGET: { name: "Ventas" },
  SUPPLIER: { name: "Proveedores" },
  EXPENSE: { name: "Gastos" },
  GENERAL: { name: "General" },
};

export const SUPPORTED_SETTINGS = {
  PRODUCT: ['tags', 'blacklist'],
  CUSTOMER: ['tags'],
  GENERAL: ['paymentMethods'],
  EXPENSE: ['tags', 'categories'],
  BUDGET: ['allowConfirmExpired', 'allowCreateWithIncompleteCustomer', 'defaultPageDateRange', 'defaultsCreate', 'defaultsPDF', 'historyDateRanges'],
};

export const SETTINGS_HELP_TEXTS = {
  TAGS: "Permite crear etiquetas para clasificar elementos y encontrarlos mas facilmente.",
  PAYMENT_METHODS: "Permite definir los metodos de pago disponibles para ventas, presupuestos y movimientos.",
  BLACKLIST: "Permite bloquear productos especificos para evitar que se utilicen en determinadas operaciones.",
  CATEGORIES: "Permite organizar gastos o productos en grupos para facilitar el analisis y la gestion.",
  BUDGET_GENERAL: "Permite configurar valores generales para consultar y revisar ventas.",
  BUDGET_ON_CREATE: "Permite definir valores predeterminados que se completan al crear una venta.",
  BUDGET_ON_PRINT: "Permite configurar como se muestra e imprime el PDF de una venta.",
};
