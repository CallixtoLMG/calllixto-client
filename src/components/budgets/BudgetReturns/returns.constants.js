export const RETURN_REASONS = {
  CLIENT_REQUEST: "Pedido del cliente",
  DAMAGED: "Producto dañado",
  WRONG_PRODUCT: "Producto incorrecto",
  COMMERCIAL_ERROR: "Error comercial",
  OTHER: "Otro",
};

export const RETURN_RESOLUTIONS = {
  DEBT_REDUCTION: "Reduce deuda",
  REFUND: "Reintegro",
  CREDIT: "Saldo a favor",
  MIXED: "Mixto",
};

export const RETURN_STATES = {
  CONFIRMED: {
    label: "Confirmada",
    color: "green",
  },
  VOIDED: {
    label: "Anulada",
    color: "red",
  },
};

export const RETURN_SUMMARY_STATES = {
  NO_RETURNS: "Sin devoluciones",
  PARTIALLY_RETURNED: "Devuelta parcialmente",
  FULLY_RETURNED: "Todo lo entregado fue devuelto",
};

export const BENEFIT_RESOLUTION_OPTIONS = {
  REFUND: "REFUND",
  CREDIT: "CREDIT",
  MIXED: "MIXED",
};

export const BENEFIT_RESOLUTION_LABELS = {
  [BENEFIT_RESOLUTION_OPTIONS.REFUND]: "Reintegrar dinero",
  [BENEFIT_RESOLUTION_OPTIONS.CREDIT]: "Saldo a favor",
  [BENEFIT_RESOLUTION_OPTIONS.MIXED]: "Combinar ambas opciones",
};

export const RETURN_REASON_OPTIONS = Object.entries(RETURN_REASONS).map(([value, text]) => ({
  key: value,
  value,
  text,
}));
