import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import * as XLSX from "xlsx";
import { BUDGET_STATES, PRODUCT_STATES, REGEX } from "./constants";

dayjs.extend(utc)
dayjs.extend(timezone)

export const now = () => {
  const date = dayjs().tz(dayjs.tz.guess()).toISOString();
  return date;
};

export const threeMonthsDate = (date) => {
  return dayjs(date).add(3, 'month').format('YYYY-MM-DD');
};

export const expirationDate = (expirationOffsetDays, createdAt = dayjs().format()) => {
  const dateCreated = dayjs(createdAt);
  const dueDate = dateCreated.add(expirationOffsetDays, 'day');
  return dueDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
};

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
  const price = getPrice(product);
  return price * product.quantity * (1 - (product.discount / 100)) || 0;
};

export const getPrice = (product) => {
  const { editablePrice, fractionConfig, price} = product;
  return editablePrice || !fractionConfig?.active ? price : fractionConfig?.value * price;
}

export const removeDecimal = (value) => {
  return value.replace(/\./g, '');
};

export const handleUndefined = (value, defaultValue = 'Sin definir') => value ?? defaultValue;

export const handleNaN = (value, defaultValue = 'Valor incorrecto') => isNaN(value) ? defaultValue : formatedPrice(value);

export const getTotalSum = (products, discount = 0, additionalCharge = 0) => {
  const subtotal = products?.reduce((a, b) => a + getTotal(b), 0);
  const discountedsubtotal = subtotal - (subtotal * (discount / 100));
  const total = discountedsubtotal + (discountedsubtotal * (additionalCharge / 100));
  return total;
};

export const getSubtotal = (total, discountOrCharge) => {
  const subtotal = total + (total * (discountOrCharge / 100));
  return subtotal;
};

export const formatedSimplePhone = (phone) => {
  if (!phone) return '';
  return `+54 ${phone.areaCode} ${phone.number}`;
};

export const getPhonesForDisplay = (phoneNumbers) => {
  if (!phoneNumbers || phoneNumbers.length === 0) return { primaryPhone: '', additionalPhones: null };

  const primaryPhone = formatedSimplePhone(phoneNumbers[0]);
  if (phoneNumbers.length === 1) return { primaryPhone, additionalPhones: null };

  const additionalPhones = phoneNumbers.slice(1);
  return { primaryPhone, additionalPhones };
};

export const getAddressesForDisplay = (addresses) => {
  if (!addresses || addresses.length === 0) return { primaryAddress: '', additionalAddress: null };

  const primaryAddress = addresses?.[0]?.address;
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

export const isBudgetDraft = (status) => {
  return status === BUDGET_STATES.DRAFT.id;
};

export const isBudgetConfirmed = (status) => {
  return status === BUDGET_STATES.CONFIRMED.id;
};

export const isBudgetCancelled = (status) => {
  return status === BUDGET_STATES.CANCELLED.id;
};

export const isBudgetExpired = (status) => {
  return status === BUDGET_STATES.EXPIRED.id;
};

export const isProductActive = (status) => {
  return status === PRODUCT_STATES.ACTIVE.id;
};

export const isProductOOS = (status) => {
  return status === PRODUCT_STATES.OOS.id;
};

export const isProductInactive = (status) => {
  return status === PRODUCT_STATES.INACTIVE.id;
};

export const isProductDeleted = (status) => {
  return status === PRODUCT_STATES.DELETED.id;
};
