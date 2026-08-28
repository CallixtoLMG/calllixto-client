import { getFormatedNumber, getFormatedPrice } from "@/common/utils";
import {
  ANALYTICS_GROUP_BY_LABELS,
  ANALYTICS_BUSINESS_TIMEZONE,
  ANALYTICS_GRANULARITY_THRESHOLDS,
  ANALYTICS_GROUP_BY,
  ANALYTICS_EXPENSE_KPI_KEYS,
  ANALYTICS_KPI_CONFIG,
  ANALYTICS_KPI_FORMATS,
  ANALYTICS_MONTH_NAMES,
  ANALYTICS_PRESETS,
  ANALYTICS_SALES_KPI_KEYS,
  ANALYTICS_SUMMARY_KPI_KEYS,
  ANALYTICS_SHORT_MONTH_NAMES,
  SALES_CHART_CONFIG,
} from "@/components/analytics/analytics.constants";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const ONE_DAY_MS = 86400000;

export { SALES_CHART_CONFIG };

export const analyticsGroupByLabels = ANALYTICS_GROUP_BY_LABELS;

export const formatShortDate = (date) => dayjs(date).format("DD/MM");
export const formatFullDate = (date) => dayjs(date).format("DD/MM/YYYY");
export const formatDateRange = (range) => `${formatShortDate(range.from)} - ${formatShortDate(range.to)}`;
export const formatPercent = (value) => `${getFormatedNumber(value)}%`;
export const formatPoints = (value) => `${value > 0 ? "+" : ""}${getFormatedNumber(value)} puntos porcentuales`;
export const toDateValue = (date) => date.format("YYYY-MM-DD");
export const getBusinessTodayValue = () => toDateValue(dayjs().tz(ANALYTICS_BUSINESS_TIMEZONE));

export const getAnalyticsRangeDayCount = (range) => {
  if (!range?.from || !range?.to) return 0;

  const from = new Date(`${range.from}T00:00:00`);
  const to = new Date(`${range.to}T00:00:00`);

  return Math.max(0, Math.round((to - from) / ONE_DAY_MS) + 1);
};

export const getAnalyticsGroupByForRange = (range) => {
  const dayCount = getAnalyticsRangeDayCount(range);

  if (dayCount <= ANALYTICS_GRANULARITY_THRESHOLDS.DAY_MAX_DAYS) return ANALYTICS_GROUP_BY.DAY;
  if (dayCount <= ANALYTICS_GRANULARITY_THRESHOLDS.WEEK_MAX_DAYS) return ANALYTICS_GROUP_BY.WEEK;

  return ANALYTICS_GROUP_BY.MONTH;
};

export const getPresetRange = (preset) => {
  const businessToday = dayjs().tz(ANALYTICS_BUSINESS_TIMEZONE);
  const baseDate = preset === ANALYTICS_PRESETS.LAST_MONTH
    ? businessToday.subtract(1, "month")
    : businessToday;

  return {
    from: toDateValue(baseDate.startOf("month")),
    to: toDateValue(preset === ANALYTICS_PRESETS.THIS_MONTH ? businessToday : baseDate.endOf("month")),
  };
};

export const getComparisonRange = (range) => {
  const from = dayjs(range.from);
  const to = dayjs(range.to);
  const dayCount = Math.max(1, to.diff(from, "day") + 1);
  const comparisonTo = from.subtract(1, "day");
  const comparisonFrom = comparisonTo.subtract(dayCount - 1, "day");

  return {
    from: toDateValue(comparisonFrom),
    to: toDateValue(comparisonTo),
  };
};

export const areSameRange = (left, right) => left.from === right.from && left.to === right.to;

export const isValidRange = (range) => {
  if (!range.from || !range.to) return false;
  const from = dayjs(range.from);
  const to = dayjs(range.to);

  return from.isValid() && to.isValid() && !from.isAfter(to);
};

const analyticsKpiFormatters = {
  [ANALYTICS_KPI_FORMATS.PRICE]: getFormatedPrice,
  [ANALYTICS_KPI_FORMATS.NUMBER]: (value) => Number(value).toLocaleString("es-AR"),
  [ANALYTICS_KPI_FORMATS.PERCENT]: formatPercent,
};

export const analyticsKpiConfig = ANALYTICS_KPI_CONFIG.map(({ formatKey, ...config }) => ({
  ...config,
  format: analyticsKpiFormatters[formatKey],
}));

export const analyticsSummaryKpiConfig = ANALYTICS_SUMMARY_KPI_KEYS.map((key) => {
  const config = analyticsKpiConfig.find((item) => item.key === key);

  if (key !== "grossProfit") return config;

  return {
    ...config,
    secondaryMetric: {
      key: "grossMargin",
      label: "de margen",
      format: analyticsKpiFormatters[ANALYTICS_KPI_FORMATS.PERCENT],
      unavailableLabel: "Sin datos de margen",
    },
  };
});

export const analyticsSalesKpiConfig = analyticsKpiConfig.filter(({ key }) => ANALYTICS_SALES_KPI_KEYS.includes(key));

export const analyticsExpenseKpiConfig = analyticsKpiConfig.filter(({ key }) => ANALYTICS_EXPENSE_KPI_KEYS.includes(key));

export const getChangeDisplay = ({ metric, changeKey, isPercentagePoints }) => {
  const rawValue = Number(metric?.[changeKey] ?? 0);
  const value = isPercentagePoints
    ? formatPoints(rawValue)
    : `${rawValue > 0 ? "+" : ""}${getFormatedNumber(rawValue)}%`;

  return {
    value,
    direction: rawValue >= 0 ? "up" : "down",
    rawValue,
  };
};

export const getChangeIsPositive = ({ change, higherIsPositive }) => {
  if (change.rawValue === 0) return true;
  return higherIsPositive ? change.rawValue > 0 : change.rawValue < 0;
};

export const getPolylinePoints = ({ points, maxValue, width, height, padding }) => {
  if (!points.length || !maxValue) return "";

  const xStep = points.length === 1 ? 0 : (width - padding.left - padding.right) / (points.length - 1);

  return points.map((point, index) => {
    const x = padding.left + (xStep * index);
    const y = padding.top + ((maxValue - point.netSales) / maxValue) * (height - padding.top - padding.bottom);

    return `${x},${y}`;
  }).join(" ");
};

export const getChartCoordinates = ({ points, maxValue, width, height, padding }) => {
  if (!points.length || !maxValue) return [];

  const xStep = points.length === 1 ? 0 : (width - padding.left - padding.right) / (points.length - 1);

  return points.map((point, index) => ({
    ...point,
    x: padding.left + (xStep * index),
    y: padding.top + ((maxValue - point.netSales) / maxValue) * (height - padding.top - padding.bottom),
  }));
};

export const getXAxisLabelIndexes = (points, maxLabels = 8) => {
  if (!points.length) return new Set();
  if (points.length <= maxLabels) return new Set(points.map((_, index) => index));

  const lastIndex = points.length - 1;
  const step = Math.ceil(lastIndex / (maxLabels - 1));
  const indexes = new Set([0, lastIndex]);

  for (let index = step; index < lastIndex; index += step) {
    indexes.add(index);
  }

  return indexes;
};

export const getChartTooltipPosition = ({ point, width, height }) => {
  const tooltipWidth = 250;
  const tooltipHeight = point.previous ? 78 : 58;
  const x = Math.min(Math.max(point.x - (tooltipWidth / 2), 8), width - tooltipWidth - 8);
  const preferredY = point.y - tooltipHeight - 14;
  const y = preferredY < 8 ? Math.min(point.y + 18, height - tooltipHeight - 8) : preferredY;

  return { x, y, width: tooltipWidth, height: tooltipHeight };
};

export const formatMonthName = (date) => {
  const parsedDate = dayjs(date);

  return `${ANALYTICS_MONTH_NAMES[parsedDate.month()]} ${parsedDate.year()}`;
};

export const formatMonthShortName = (date) => {
  const parsedDate = dayjs(date);

  return `${ANALYTICS_SHORT_MONTH_NAMES[parsedDate.month()]} ${String(parsedDate.year()).slice(2)}`;
};

export const formatCategoryName = (value = "") => {
  if (!value) return "";

  return `${value.charAt(0).toLocaleLowerCase("es-AR")}${value.slice(1)}`;
};

export const formatBucketLabel = (point, groupBy) => {
  if (groupBy === ANALYTICS_GROUP_BY.MONTH) return formatMonthName(point.periodLabel ?? point.periodStart);
  if (groupBy === ANALYTICS_GROUP_BY.WEEK && point.periodEnd) {
    return `${formatShortDate(point.periodStart)} - ${formatShortDate(point.periodEnd)}`;
  }

  return formatShortDate(point.periodStart);
};

export const formatXAxisLabel = (point, groupBy) => {
  if (groupBy === ANALYTICS_GROUP_BY.MONTH) return formatMonthShortName(point.periodLabel ?? point.periodStart);
  if (groupBy === ANALYTICS_GROUP_BY.WEEK && point.periodEnd) {
    return `${formatShortDate(point.periodStart)}-${formatShortDate(point.periodEnd)}`;
  }

  return formatShortDate(point.periodStart);
};
