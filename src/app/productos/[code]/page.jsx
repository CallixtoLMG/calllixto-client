import { showProduct } from "@/apiCalls/products";
import ShowProduct from "@/components/products/ShowProduct";

async function Product({ params }) {
  const product = await showProduct(params.code);

  return (
    <ShowProduct product={product.product} />
  )
};

export default Product;