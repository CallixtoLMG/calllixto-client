import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

export const createDate = () => {
  const date = new Date()
  const timezone = dayjs.tz.guess()
  const formattedDate = dayjs(date).tz(timezone).local().toDate().toLocaleString()
  return formattedDate
}

export const totalSum = (value) => {
  return (
    value?.reduce((accumulator, product) => {
      return accumulator + Number(product.total || 0);
    }, 0).toFixed(2)
  );
};

export const IVA = (value) => {
  value = Number(value)
  const iva = value * 0.21;
  return iva.toFixed(2);
};

export const totalIVA = (value) => {
  value = Number(value)
  const iva = value * 0.21;
  const totalConIVA = value + iva;
  return totalConIVA.toFixed(2);
};

export const modDate = (date) => date?.split("T")[0];

export const modPrice = (number) => {
  let modNumber = Number(number);
  return modNumber.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
};
