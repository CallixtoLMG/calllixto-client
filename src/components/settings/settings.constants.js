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
    singular: "día",
    plural: "días",
    article: { singular: "Último", plural: "Últimos" },
  },
  week: {
    max: 7,
    singular: "semana",
    plural: "semanas",
    article: { singular: "Última", plural: "Últimas" },
  },
  month: {
    max: 12,
    singular: "mes",
    plural: "meses",
    article: { singular: "Último", plural: "Últimos" },
  },
};

export const BUDGET_RANGE_DATE_MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const value = i + 1;
  return {
    key: value,
    value,
    text: value === 1 ? "1 mes" : `${value} meses`,
  };
});