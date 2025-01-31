import { isValidElement } from "react";
import * as XLSX from "xlsx";
import { REGEX } from "../constants";

export const getFormatedPrice = (number) => {
  return Number(number).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
};

export const getFormatedNumber = (number) => {
  return Number(number).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
};

export const getFormatedPercentage = (number = 0) => {
  return number + " %"
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

export const handleEnterKeyPress = (e, action) => {
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

export const validateEmail = (email) => {
  return REGEX.EMAIL.test(email);
};

export const validatePhone = (phone) => {
  return phone?.areaCode?.length + phone?.number?.length === 10;
};

export const isItemInactive = (state) => {
  return state === "INACTIVE";
};

export const isItemDeleted = (state) => {
  return state === "DELETED";
};

export const renderContent = (content) => {
  return typeof content === 'string' ? content : (
    isValidElement(content) ? content : null
  );
};

export const createFilter = (filters, keysToFilter, exceptions = {}) => {
  return item => {
    for (const key of keysToFilter) {
      if (filters[key]) {
        const filterWords = filters[key].toLowerCase().split(/\s+/);

        const itemValue = typeof item[key] === 'string'
          ? item[key].toLowerCase()
          : typeof exceptions[key] === 'function'
            ? exceptions[key](item).toLowerCase()
            : '';

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

export const getDefaultListParams = (attributes, sort, order) => {
  const params = {
    attributes: encodeUri(Object.values(attributes)),
  };

  if (sort) params.sort = sort;
  if (typeof order !== 'undefined') params.order = order;

  return params;
};