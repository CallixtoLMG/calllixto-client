import { getEntityById } from "@/api/entity";
import PageClient from "./page.client";

const Product = async ({ params }) => {
  const product = await getEntityById({ id: params?.id, path: "products", responseEntity: "product" });

  return <PageClient product={product} />;
};

export default Product;
