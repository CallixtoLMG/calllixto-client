import { getProduct } from "@/api/products";
import ShowProduct from "@/components/products/ShowProduct";

async function Product({ params }) {
  const product = await getProduct(params.code);

  return (
    <ShowProduct product={product.product} />
  )
};

export default Product;