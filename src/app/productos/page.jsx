
// import { validateToken } from "@/api/login";
import { productsList } from "@/api/products";
import ProductsPage from "@/components/products/ProductsPage";
// import { useRouter } from "next/navigation";

async function Products() {
  // // const router = useRouter()
  // const [isValidToken, roles] = await validateToken()
  // if (!isValidToken) {
  //   // router.push("/login")
  // }

  // if (!roles.includes("admin")) {
  //   // router.push("/login") // not found
  // }

  const products = await productsList();

  return (
    <ProductsPage products={products} />
  )
};

export default Products;