import { getProductById } from "@/api/products.server";
import { PAGE_CONSTANTS } from "@/common/constants/pages";
import { redirect } from "next/navigation";
import ProductPage from "./ProductPage";

const Product = async ({ params }) => {
  const { product, status } = await getProductById(params?.id);

  if ([401, 403].includes(status)) {
    redirect(PAGE_CONSTANTS.LOGIN.BASE);
  }

  if (!product) {
    redirect(PAGE_CONSTANTS.NOT_FOUND.BASE);
  }

  return <ProductPage product={product} />;
};

export default Product;
