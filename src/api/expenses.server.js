import { getServerEntityById } from "./server";

export const getExpenseById = (id) => getServerEntityById({
  id,
  path: "expenses",
  responseEntity: "expense",
});
