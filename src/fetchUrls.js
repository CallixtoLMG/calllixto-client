import { ENTITIES } from "./common/constants";

export const PATHS = {
  BUDGETS: ENTITIES.BUDGETS,
  CUSTOMERS: ENTITIES.CUSTOMERS,
  PRODUCTS: ENTITIES.PRODUCTS,
  LOGIN: "login",
  BRANDS: ENTITIES.BRANDS,
  SUPPLIERS: ENTITIES.SUPPLIERS,
  EXPENSES: ENTITIES.EXPENSES,
  USERS: ENTITIES.USERS,
  USER: ENTITIES.USER,
  SETTINGS: ENTITIES.SETTINGS,
  PAYMENTS: ENTITIES.PAYMENTS,
  USER_PROFILE: "userProfile",
  RESTORE_PASSWORD: `${ENTITIES.USERS}/restore`,
  CHANGE_PASSWORD: "changePassword",
  CASH_BALANCES: ENTITIES.CASH_BALANCES,
  BUDGETS_HISTORY: ENTITIES.BUDGETS_HISTORY,
  STOCK_FLOWS: ENTITIES.STOCK_FLOWS,
  STOCK_FLOW: ENTITIES.STOCK_FLOW,
};

export const BATCH = "batch";
export const SUPPLIER = "supplier";
export const BLACK_LIST = "blacklist";
export const CLIENT = "clients";
export const VALIDATE = "validate";
export const EDIT_BATCH = "transact";
export const URL = process.env.NEXT_PUBLIC_URL;
export const PAYMENTS = "payments";
export const CONFIRM = "confirm";
export const CANCEL = "cancel";