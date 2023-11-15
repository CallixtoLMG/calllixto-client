import { loadProducts } from "@/apiCalls/products";
import ProductsPage from "@/components/products/ProductsPage";

async function Products() {

  const products = await loadProducts();

  return (
    <ProductsPage products={products} />
  )
};

export default Products;