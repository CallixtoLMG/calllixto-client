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

export const totalSum = (value, propName) => {
  return (
    value?.reduce((accumulator, product) => {
      return accumulator + Number(product[propName] || 0);
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

export const formatedDate = (date) => date?.split("T")[0];

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
  return products.reduce((a, b) => a + getTotal(b), 0);
};
