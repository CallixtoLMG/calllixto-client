import { getServerEntityById } from "./server";

export const getBrandById = (id) => getServerEntityById({
  id,
  path: "brands",
  responseEntity: "brand",
});
