// V0 visual mock only.
// TODO: replace with returns API when backend contract exists.

export const MOCK_BUDGET_RETURNS = [
  {
    id: "RET-0001",
    date: "2026-08-12T14:30:00.000Z",
    reason: "DAMAGED",
    productCount: 1,
    returnedAmount: 550,
    resolution: "DEBT_REDUCTION",
    state: "CONFIRMED",
  },
  {
    id: "RET-0002",
    date: "2026-08-18T10:15:00.000Z",
    reason: "CLIENT_REQUEST",
    productCount: 2,
    returnedAmount: 700,
    resolution: "MIXED",
    state: "CONFIRMED",
  },
  {
    id: "RET-0003",
    date: "2026-08-20T16:05:00.000Z",
    reason: "COMMERCIAL_ERROR",
    productCount: 1,
    returnedAmount: 300,
    resolution: "CREDIT",
    state: "VOIDED",
  },
];

export const MOCK_RETURNED_QUANTITY_BY_ROW_ID = {};

export const MOCK_RETURNS_SUMMARY_STATE = "PARTIALLY_RETURNED";

export const getMockPreviouslyReturnedQuantity = (product) => {
  if (!product?.rowId) return 0;

  return Number(MOCK_RETURNED_QUANTITY_BY_ROW_ID[product.rowId] ?? 0);
};
