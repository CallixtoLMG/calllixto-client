import { getServerEntityById } from "./server";

export const getSupplierById = (id) => getServerEntityById({
  id,
  path: "suppliers",
  responseEntity: "supplier",
});
