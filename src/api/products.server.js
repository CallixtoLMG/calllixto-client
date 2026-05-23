import { getServerEntityById } from "./server";

export const getProductById = (id) => getServerEntityById({
  id,
  path: "products",
  responseEntity: "product",
});
