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

export const getEighteenYearsAgo = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18, 0, 1);
  return date;
};
