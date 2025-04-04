import { PRODUCT_STATES } from "./products.constants";

export const getSupplierCode = (code) => {
  return code?.slice(0, 2);
};

export const getBrandCode = (code) => {
  return code?.slice(2, 4);
};

export const getProductCode = (code) => {
  return code?.slice(4);
};

export const getFormatedMargin = (price, cost) => {
  const safePrice = Number(price) || 0;
  const safeCost = Number(cost) || 0;

  if (safeCost === 0) return '% 0';

  const margin = ((safePrice / safeCost) - 1) * 100;
  const roundedMargin = Math.round(margin * 100) / 100;

  return `% ${roundedMargin}`; 
};

export const getMargin = (price, cost) => {
  const safePrice = Number(price) || 0;
  const safeCost = Number(cost) || 0;

  if (safeCost === 0) return 0; 
  const margin = ((safePrice / safeCost) - 1) * 100;
  return Math.round(margin * 100) / 100;
};

export const formatProductCode = (code) => {
  const supplierCode = getSupplierCode(code);
  const brandCode = getBrandCode(code);
  const productCode = getProductCode(code);

  return `${supplierCode}-${brandCode}-${productCode}`;
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

export const getPrice = (product) => {
  const { fractionConfig, price } = product;
  return fractionConfig?.active ? fractionConfig?.value * price : price;
};

export const getTotal = (product) => {
  const price = getPrice(product);
  return price * product.quantity * (1 - (product.discount / 100)) ?? 0;
};

export const calculateMargin = (price, cost) => {
  if (!cost || cost === 0) return 0;
  const margin = ((price / cost - 1) * 100);
  return parseFloat(margin.toFixed(2));
};

export const calculatePriceFromMargin = (cost, margin) => {
  const price = cost * (1 + margin / 100);
  return parseFloat(price.toFixed(2));
};