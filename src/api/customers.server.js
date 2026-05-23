import { getServerEntityById } from "./server";

export const getCustomerById = (id) => getServerEntityById({
  id,
  path: "customers",
  responseEntity: "customer",
});
