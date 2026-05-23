import { PAGE_CONSTANTS } from "@/common/constants/pages";
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
  PRODUCT: { name: PAGE_CONSTANTS.PRODUCTS.NAME },
  CUSTOMER: { name: PAGE_CONSTANTS.CUSTOMERS.NAME },
  BRAND: { name: PAGE_CONSTANTS.BRANDS.NAME },
  BUDGET: { name: PAGE_CONSTANTS.BUDGETS.NAME },
  SUPPLIER: { name: PAGE_CONSTANTS.SUPPLIERS.NAME },
  EXPENSE: { name: PAGE_CONSTANTS.EXPENSES.NAME },
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
  BUDGET_DEFAULT_PAGE_DATE_RANGE: "Define el rango de fechas que se muestra por defecto al entrar al listado de ventas.",
  BUDGET_HISTORY_DATE_RANGES: "Permite agregar accesos rapidos de fechas para consultar ventas anteriores en el historial.",
  BUDGET_DEFAULT_STATE: "Define si las nuevas ventas se crean como confirmadas o pendientes por defecto.",
  BUDGET_DEFAULT_DELIVERY: "Define si las nuevas ventas se preparan para retirar en local o para enviar a domicilio.",
  BUDGET_DEFAULT_CUSTOMER: "Permite seleccionar un cliente que se carga automaticamente al crear una venta.",
  BUDGET_DEFAULT_EXPIRATION_DAYS: "Define cuantos dias tendra una venta antes de vencer por defecto.",
  BUDGET_DEFAULT_SHOW_PRICES: "Define si el PDF de la venta muestra precios por defecto.",
  BUDGET_DEFAULT_PRINT_MODE: "Define el formato de impresion que se selecciona por defecto para el PDF.",
  BUDGET_PDF_DISCLAIMER: "Permite agregar un texto aclaratorio que se muestra en el PDF de la venta.",
};
