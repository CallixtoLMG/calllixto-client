import { DATE_FORMATS } from "@/common/constants";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const now = () => {
  return dayjs().utc().format(DATE_FORMATS.ISO);
};

export const datePickerNow = () => {
  return dayjs().toDate();
};

export const getDateWithOffset = ({ date, offset, unit = 'days', format = DATE_FORMATS.ONLY_DATE }) => {
  return dayjs(date).utc().add(offset, unit).format(format);
};

export const getFormatedDate = (date, format = DATE_FORMATS.ONLY_DATE) => {
  return dayjs(date).format(format);
};

export function getDateUTC(date) {
  return dayjs(date).utc().toISOString();
}

export const getPastDate = (amount, unit = "years") => {
  const date = new Date();

  switch (unit) {
    case "years":
      date.setFullYear(date.getFullYear() - amount);
      break;
    case "months":
      date.setMonth(date.getMonth() - amount);
      break;
    case "days":
      date.setDate(date.getDate() - amount);
      break;
    default:
      throw new Error("Unidad de tiempo no soportada. Usa 'years', 'months' o 'days'.");
  }

  return date;
};

export const getSortedPaymentsByDate = (paymentsMade = []) => {
  return [...paymentsMade].sort(
    (a, b) => dayjs(a.date || 0).valueOf() - dayjs(b.date || 0).valueOf()
  );
};

export const isDateAfter = (date1, date2) => {
  return dayjs(date1).isAfter(dayjs(date2));
};

export const isDateBefore = (date1, date2) => {
  return dayjs(date1).isBefore(dayjs(date2));
};

export function getDayDifference(date1, date2) {
  const d1 = dayjs(date1);
  const d2 = dayjs(date2);
  return d1.diff(d2, 'day');
}

export function getStartOfUnit(date, unit = 'day') {
  return dayjs(date).startOf(unit).toDate();
}

export function getEndOfUnit(date, unit = 'day') {
  return dayjs(date).endOf(unit).toDate();
}

