import dayjs from "dayjs";
import { isValidElement } from "react";
import * as XLSX from "xlsx";
import { ALL, CANCELLED, INACTIVE, REGEX } from "../constants";
import { isDateAfter } from "./dates";

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

export const isItemCancelled = (state) => {
  return state === toUpperCase(CANCELLED);
};

export const renderContent = (content) => {
  return typeof content === 'string' ? content : (
    isValidElement(content) ? content : null
  );
};

export const createFilter = (filters, config) => {
  return (item) => {
    for (const [key, { skipAll, arrayKey, fullMatch, isArray, field, custom }] of Object.entries(config)) {
      const filter = filters[key];
      if (filters[key]) {

        if (custom) {
          const isValid = custom(item);
          if (!isValid) {
            return false;
          }
          continue;
        }

        if (skipAll && filter === ALL) {
          continue;
        }

        const filterWords = normalizeText(filter).split(/\s+/);

        if (arrayKey) {
          const anyArrayItemMatches = item[key]?.some(arrayItem => {
            if (fullMatch) {
              return normalizeText(arrayItem[arrayKey]) === normalizeText(filter);
            }
            return filterWords.every(word => normalizeText(arrayItem[arrayKey]).includes(word));
          });

          if (!anyArrayItemMatches) {
            return false;
          }
          continue;
        }

        if (isArray) {
          const anyArrayItemMatches = item[key]?.some(item => {
            if (fullMatch) {
              return normalizeText(item) === normalizeText(filter);
            }
            return filterWords.every(word => normalizeText(item).includes(word));
          });

          if (!anyArrayItemMatches) {
            return false;
          }
          continue;
        }

        const value = field ? normalizeText(item[key]?.[field]) : normalizeText(item[key]);

        if (fullMatch) {
          if (value !== normalizeText(filter)) {
            return false;
          }
          continue;
        }

        const allWordsMatch = filterWords.every(word => value.includes(word));
        if (!allWordsMatch) {
          return false;
        }
      }
    }

    return true;
  };
};

export const normalizeText = (text = "") =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const getDefaultListParams = (attributes = []) => {
  return { attributes: encodeUri(getDefaultAttributes(attributes)) };
};

export const getDefaultAttributes = (attributes = []) => [...attributes, 'updatedAt', 'createdAt'];

export const toUpperCase = (text = "") => {
  if (typeof text !== "string") return "";
  return text.toUpperCase();
};

export const isNewFeature = (releasedAt, days = 14) => {
  if (!releasedAt) return false;

  const expirationDate = dayjs(releasedAt).add(days, 'day');

  return !isDateAfter(new Date(), expirationDate);
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

export const mapToDropdownOptions = (items = []) =>
  items.map((item) => ({
    key: item?.toLowerCase().replace(/\s+/g, "_"),
    text: item,
    value: item,
    name: item,
    color: "grey"
  }));

export const getLabelColor = (entity, states) => states?.[entity?.state]?.color;

export const calculateTotals = (payments = [], total) => {
  const totalPaid = payments?.reduce((sum, payments) => sum + (parseFloat(payments.amount) || 0), 0).toFixed(2);
  let totalPending = (total - totalPaid).toFixed(2);

  if (Math.abs(totalPending) < 0.01) {
    totalPending = (0).toFixed(2);
  }

  return { totalPaid, totalPending };
};
