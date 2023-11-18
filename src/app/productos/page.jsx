import { productsList } from "@/api/products";
import ProductsPage from "@/components/products/ProductsPage";

async function Products() {

  const products = await productsList();

  return (
    <ProductsPage products={products} />
  )
};

export default Products;