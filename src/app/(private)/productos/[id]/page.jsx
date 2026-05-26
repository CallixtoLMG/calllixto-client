import { getEntityById } from "@/api/entity";
import { ENTITIES } from "@/common/constants/entities";
import ProductPageClient from "./page.client";

const Product = async ({ params }) => {
  const product = await getEntityById({
    id: params?.id,
    path: ENTITIES.PRODUCTS,
    responseEntity: ENTITIES.PRODUCT,
  });

  return <ProductPageClient product={product} />;
};

export default Product;
