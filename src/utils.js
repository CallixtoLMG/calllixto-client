import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import * as XLSX from "xlsx";
import { REGEX } from "./constants";

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
export const actualDate = dayjs();
export const formatedDateAndHour = (date) => dayjs(date).format('DD-MM-YYYY - hh:mm A');
export const formatedDateOnly = (date) => dayjs(date).format('DD-MM-YYYY');

export const formatedPrice = (number) => {
  return Number(number).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
};

export function encodeUri(value) {
  if (value !== undefined && value !== null) {
    return encodeURIComponent(JSON.stringify(value));
  }
  return undefined;
};

export const formatedPricePdf = (number) => {
  let modNumber = Number(number);
  modNumber = Math.ceil(modNumber);
  return modNumber.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  });
};

export const simpleFormatedPrice = (number) => {
  let modNumber = Math.round(Number(number));
  return `$ ${modNumber}`
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

export const formatedPercentage = (number = 0) => {
  return number + " %"
}

export const getTotal = (product) => {
  return product.price * product.quantity * (1 - (product.discount / 100)) || 0;
};

export const cleanValue = (value) => {
  return value.replace(/,/g, '');
};

export const removeDecimal = (value) => {
  return value.replace(/\./g, '');
};

export const getTotalSum = (products, discount = 0) => {
  const totalSum = products?.reduce((a, b) => a + getTotal(b), 0);
  const discountedTotal = totalSum - (totalSum * (discount / 100));
  return discountedTotal;
};

export const formatedSimplePhone = (phoneNumbers) => {
  if (!phoneNumbers) return '';
  return `+54 ${phoneNumbers.areaCode} ${phoneNumbers.number}`;
};

export const formatedPhone = (phoneNumbers) => {
  if (phoneNumbers?.length === 0) return '';
  return phoneNumbers?.map(phone => `+54 ${phone.areaCode} ${phone.number}`).join(', ');
};

export const formatPhoneForDisplay = (phoneNumbers) => {
  if (!phoneNumbers || phoneNumbers.length === 0) return { primaryPhone: '', additionalPhones: null };

  const primaryPhone = `+54 ${phoneNumbers[0]?.areaCode} ${phoneNumbers[0]?.number}`;
  if (phoneNumbers.length === 1) return { primaryPhone, additionalPhones: null };

  const additionalPhones = phoneNumbers.slice(1);
  return { primaryPhone, additionalPhones };
};

export const formatAddressForDisplay = (addresses) => {
  if (!addresses || addresses.length === 0) return { primaryAddress: '', additionalAddress: null };

  const primaryAddress = addresses[0]?.address;
  if (addresses.length === 1) return { primaryAddress, additionalAddress: null };

  const additionalAddresses = addresses.slice(1);
  return { primaryAddress, additionalAddresses };
};

export const getSupplierCode = (code) => {
  return code?.slice(0, 2);
};

export const getBrandCode = (code) => {
  return code?.slice(2, 4);
};

export const getProductCode = (code) => {
  return code?.slice(4);
};

export const preventSend = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
  };
};

export const downloadExcel = (data, fileName) => {
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const handleEnterKeyPress = (e, action) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    action(e);
  }
};

export const validateEmail = (email) => {
  return REGEX.EMAIL.test(email);
};

export const validatePhone = (phone) => {
  return phone?.areaCode?.length + phone?.number?.length === 10;
};

