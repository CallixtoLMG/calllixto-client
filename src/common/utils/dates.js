import { DATE_FORMATS } from "@/common/constants";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const now = () => {
  return dayjs().tz(dayjs.tz.guess()).toISOString();
};

export const getDateWithOffset = (date, offset, unit) => {
  return dayjs(date).add(offset, unit).format(DATE_FORMATS.ONLY_DATE);
};

export const getFormatedDate = (date, format = DATE_FORMATS.ONLY_DATE) => {
  return dayjs(date).format(format);
};

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
