import { DATE_FORMATS, ERROR_MESSAGES } from "@/common/constants";
import { getDateWithOffset, getEndOfUnit, getStartOfUnit } from "@/common/utils/dates";
import { formatLastCount } from "@/common/utils/pluralization";

// Keep the working Budgets contract: UTC, second precision, without a suffix.
export const serializeBudgetDate = (date) => getDateWithOffset({ date, offset: 0, format: DATE_FORMATS.ISO });

export const parseBudgetDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}Z`);
  return !Number.isNaN(date.getTime()) && serializeBudgetDate(date) === value ? date : null;
};

export const getBudgetDateRangeError = ({ startDate, endDate }) => {
  if (!startDate || !endDate) return ERROR_MESSAGES.REQUIRED_FIELD_SHORT;
  const start = parseBudgetDate(startDate);
  const end = parseBudgetDate(endDate);
  if (!start || !end) return "Fecha inválida";
  return start <= end ? null : "Desde debe ser anterior o igual a Hasta";
};

export const getAutomaticBudgetRange = (months, date = new Date()) => ({
  startDate: getDateWithOffset({ date, offset: -months, unit: "month", format: DATE_FORMATS.ISO }),
  endDate: serializeBudgetDate(date),
});

export const getManualBudgetDate = (date, field) => date ? serializeBudgetDate(
  field === "endDate" ? getEndOfUnit(date, "day") : getStartOfUnit(date, "day")
) : "";

export const BASE_SALES_DATE_RANGES = [
  { label: "Hoy", value: "base_today", unit: "day" },
  { label: "Esta semana", value: "base_week", unit: "week" },
  { label: "Este mes", value: "base_month", unit: "month" },
  { label: "Este año", value: "base_year", unit: "year" },
].map(({ unit, ...option }) => ({
  ...option,
  getRange: (date = new Date()) => ({
    startDate: serializeBudgetDate(getStartOfUnit(date, unit)),
    endDate: serializeBudgetDate(date),
  }),
}));

export const buildSalesDateRanges = (ranges = []) => (Array.isArray(ranges) ? ranges : [])
  .filter(({ unit, value }) => ["day", "week", "month"].includes(unit) && Number.isInteger(Number(value)) && Number(value) > 0)
  .map(({ unit, value }) => ({
    label: formatLastCount(Number(value), unit),
    value: `custom_${unit}_${Number(value)}`,
    getRange: (date = new Date()) => ({
      startDate: getDateWithOffset({
        date: getStartOfUnit(date, "day"), offset: -Number(value), unit, format: DATE_FORMATS.ISO,
      }),
      endDate: serializeBudgetDate(date),
    }),
  }));
