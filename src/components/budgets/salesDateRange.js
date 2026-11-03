import { DATE_FORMATS, ERROR_MESSAGES } from "@/common/constants";
import { getDateWithOffset, getEndOfUnit, getStartOfUnit } from "@/common/utils/dates";
import { formatCount, formatLastCount } from "@/common/utils/pluralization";

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

export const getRestoredSalesPreset = ({ presetRange, startDate, endDate }, presets) => {
  const preset = presets.find(({ value }) => value === presetRange);
  if (!preset) return "";

  const current = preset.getRange();
  // Presets end at selection time. On return, compare the visible local end day without moving the saved timestamp.
  const sameEndDay = parseBudgetDate(endDate)?.toDateString() === parseBudgetDate(current.endDate)?.toDateString();
  return startDate === current.startDate && sameEndDay ? preset.value : "";
};

const calendarDay = (date) => new Date(0).setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
const DAY_MS = 24 * 60 * 60 * 1000;

export const getAppliedSalesRangeLabel = ({ startDate, endDate, presetRange, defaultRangeMonths }, presets) => {
  const start = parseBudgetDate(startDate);
  const end = parseBudgetDate(endDate);
  if (!start || !end || start > end) return "";

  const preset = presets.find(({ value }) => value === presetRange);
  if (preset) return preset.label;

  const defaultMonths = Number(defaultRangeMonths);
  if (Number.isInteger(defaultMonths) && defaultMonths > 0) return formatLastCount(defaultMonths, "month");

  const endExclusive = new Date(calendarDay(end) + DAY_MS);
  const months = (endExclusive.getUTCFullYear() - start.getFullYear()) * 12 + endExclusive.getUTCMonth() - start.getMonth();
  if (months > 0 && start.getDate() === endExclusive.getUTCDate()) return formatCount(months, "month");

  const days = (endExclusive.getTime() - calendarDay(start)) / DAY_MS;
  return days % 7 === 0 ? formatCount(days / 7, "week") : formatCount(days, "day");
};
