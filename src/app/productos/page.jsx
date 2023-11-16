import { Productslist } from "@/api/products";
import ProductsPage from "@/components/products/ProductsPage";

async function Products() {

  const products = await Productslist();

  return (
    <ProductsPage products={products} />
  )
};

export default Products;