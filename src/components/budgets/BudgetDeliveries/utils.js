export const TOO_MANY_ITEMS_DELIVERY_MESSAGE = "No se pudo registrar la entrega porque hay demasiados productos para procesar juntos. Intentá realizar la entrega en tandas más pequeñas (40 elementos aprox).";

const DEFAULT_CONSUME_STOCK_ERROR_MESSAGE = 'Error al registrar movimiento';
const STOCK_CONTROL_DISABLED_FAILURE_REASON = "El control de stock está desactivado en este producto.";
const TOO_MANY_ITEMS_ERROR_NAME = "TooManyItemsError";

const getConsumeStockFailures = (response) => {
  return Array.isArray(response?.failed) ? response.failed : [];
};

export const isStockControlDisabledFailure = (failure) => {
  return failure?.failedReason === STOCK_CONTROL_DISABLED_FAILURE_REASON;
};

export const hasOnlyStockControlDisabledFailures = (response) => {
  const failures = getConsumeStockFailures(response);

  return failures.length > 0 && failures.every(isStockControlDisabledFailure);
};

export const hasConsumeStockResponseError = (response) => {
  const failures = getConsumeStockFailures(response);

  return response?.statusOk !== true || Boolean(response?.error) || (failures.length > 0 && !hasOnlyStockControlDisabledFailures(response));
};

export const hasConsumeStockResponseWarning = (response) => {
  return response?.statusOk === true && !response?.error && hasOnlyStockControlDisabledFailures(response);
};

export const isTooManyItemsConsumeStockError = (response) => {
  return response?.error?.message?.includes(TOO_MANY_ITEMS_ERROR_NAME) ?? false;
};

export const getConsumeStockErrorMessage = (response) => {
  if (isTooManyItemsConsumeStockError(response)) {
    return TOO_MANY_ITEMS_DELIVERY_MESSAGE;
  }

  return response?.message || response?.error?.message || DEFAULT_CONSUME_STOCK_ERROR_MESSAGE;
};

export const getConsumeStockWarningMessage = (response) => {
  if (!hasConsumeStockResponseWarning(response)) return undefined;

  const count = getConsumeStockFailures(response).length;

  return count === 1
    ? "Entrega registrada. 1 producto no modificó stock porque tiene el control de stock desactivado."
    : `Entrega registrada. ${count} productos no modificaron stock porque tienen el control de stock desactivado.`;
};

export const getStockControlDisabledProductIds = (products = []) => {
  return products
    .filter((product) => product?.stockControl === false)
    .map((product) => product.id)
    .filter(Boolean);
};

export const hasStockControlDisabledProduct = (budgetProduct, stockControlDisabledProductIds) => {
  return Boolean(budgetProduct?.id && stockControlDisabledProductIds?.has?.(budgetProduct.id));
};
