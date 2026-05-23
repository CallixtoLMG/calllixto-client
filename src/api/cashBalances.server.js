import { getServerEntityById } from "./server";

export const getCashBalanceById = (id) => getServerEntityById({
  id,
  path: "cash-balances",
  responseEntity: "cashBalance",
});
