import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc)
dayjs.extend(timezone)

export const now = () => {
  const date = dayjs().tz(dayjs.tz.guess()).toISOString();
  return date;
};

export const expirationDate = (createdAt, expirationOffsetDays) => {
  const fechaCreacionParsed = dayjs(createdAt);
  const fechaVencimiento = fechaCreacionParsed.add(expirationOffsetDays, 'day');
  return fechaVencimiento.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
};

export const formatedDate = (date) => dayjs(date).format('DD-MM-YYYY - hh:mm A');

export const formatedPrice = (number) => {
  let modNumber = Number(number);
  return modNumber.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
};

export const formatProductCodePopup = (code, brand, supplier) => {
  const firstPart = code ? code?.substring(0, 2) : "";
  const secondPart = code ? code?.substring(2, 4) : "";
  const thirdPart = code ? code?.substring(4) : "";

  return {
    formattedCode: `${firstPart}-${secondPart}-${thirdPart}`,
    brandName: brand,
    supplierName: supplier,
  };
};

export const formatProductCode = (code) => {
  const firstPart = code ? code?.substring(0, 2) : "";
  const secondPart = code ? code?.substring(2, 4) : "";
  const thirdPart = code ? code?.substring(4) : "";

  return `${firstPart}-${secondPart}-${thirdPart}`
};

export const formatedPercentage = (number) => {
  return number + " %"
}

export const getTotal = (product) => {
  return product.price * product.quantity * (1 - (product.discount / 100)) || 0;
};

export const getTotalSum = (products) => {
  return products?.reduce((a, b) => a + getTotal(b), 0);
};

export const formatedPhone = (area, num) => {
  if (!num || !area) return '';
  return `+54 ${area} ${num}`;
};

export const getSupplierCode = (code) => {
  return code.slice(0, 2);
}

export const getBrandCode = (code) => {
  return code.slice(2, 4);
}

export const getProductCode = (code) => {
  return code.slice(4);
}
