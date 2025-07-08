import { isValidElement } from "react";
import * as XLSX from "xlsx";
import { INACTIVE, REGEX } from "../constants";

export const getFormatedPrice = (number) => {
  const safeNumber = Number(number) ?? 0;
  return safeNumber.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
};

export const getFormatedNumber = (number) => {
  return Number(number).toLocaleString("es-AR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

export const getFormatedPhone = (phone) => {
  if (!phone) return '';
  return `+54 ${phone.areaCode} ${phone.number}`;
};

export function encodeUri(value) {
  if (value !== undefined && value !== null) {
    return encodeURIComponent(JSON.stringify(value));
  }
  return undefined;
};

export const handleUndefined = (value, defaultValue = 'Sin definir') => value ?? defaultValue;

export const getFormatedPercentage = (value) => {
  const safeValue = Number(value);
  if (isNaN(safeValue)) {
    return `0 %`;
  }
  return `${safeValue} % `;
};

export const getPhonesForDisplay = (phoneNumbers) => {
  if (!phoneNumbers || phoneNumbers.length === 0) return { primaryPhone: '', additionalPhones: null };

  const primaryPhone = getFormatedPhone(phoneNumbers[0]);
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

export const downloadExcel = (data, fileName) => {
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const preventSend = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
  };
};

export const handleEnterKeyDown = (e, action) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    action(e);
  }
};

export const handleKeyPressWithSubmit = (e, isActionEnabled, isLoading, handleSubmit, onConfirm) => {
  if (e.key === 'Enter' && isActionEnabled && !isLoading) {
    e.preventDefault();
    handleSubmit(onConfirm)();
  }
};

export const handleEscapeKeyDown = (e, action) => {
  if (e.key === 'Escape') {
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

export const isItemInactive = (state) => {
  return state === toUpperCase(INACTIVE);
};

export const renderContent = (content) => {
  return typeof content === 'string' ? content : (
    isValidElement(content) ? content : null
  );
};

export const createFilter = (filters, keysToFilter, exceptions = {}) => {
  return (item) => {
    for (const key of keysToFilter) {
      if (filters[key]) {
        const filterWords = normalizeText(filters[key]).split(/\s+/);

        const itemValue = typeof item[key] === "string"
          ? normalizeText(item[key])
          : typeof exceptions[key] === "function"
            ? normalizeText(exceptions[key](item))
            : "";

        const allWordsMatch = filterWords.every(word => itemValue.includes(word));
        if (!allWordsMatch) {
          return false;
        }
      }
    }

    if (filters.state && filters.state !== item.state && filters.state !== exceptions.allState) {
      return false;
    }

    return true;
  };
};

export const normalizeText = (text) => text?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() ?? "";

export const getDefaultListParams = (attributes = []) => {
  return { attributes: encodeUri([ ...attributes, 'updatedAt', 'createdAt' ]) };
};

export const toUpperCase = (text = "") => {
  if (typeof text !== "string") return "";
  return text.toUpperCase();
};

export const getNumberFormated = (value) => {
  const strNumber = String(value)
    .replace(/[^0-9.]/g, "")
    .replace(/(\..*?)\./g, "$1");

  let [integerPart, decimalPart] = strNumber.split(".");

  if (decimalPart !== undefined) {
    decimalPart = decimalPart.slice(0, 2);
  }

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const asString = decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  const asNumber = Number(`${integerPart}.${decimalPart || ""}`);

  return [asString, asNumber];
};
