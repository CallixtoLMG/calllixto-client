import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc)
dayjs.extend(timezone)

export const createDate = () => {
  const date = dayjs().tz(dayjs.tz.guess()).toISOString();
  return date;
}

export const formatedDate = (date) => dayjs(date).format('DD-MM-YYYY - hh:mm A');

export const formatedPrice = (number) => {
  let modNumber = Number(number);
  return modNumber.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
};

export const getTotal = (product) => {
  return product.price * product.quantity * (1 - (product.discount / 100)) || 0;
};

export const getTotalSum = (products) => {
  return products?.reduce((a, b) => a + getTotal(b), 0);
};

export const formatedPhone = (area, num) => {
  if (!num || !area) return 'Sin datos.';
  return `+54-${area}-${num}`
};

