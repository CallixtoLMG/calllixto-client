import ProductsPage from "@/components/products/ProductsPage";
import { toast } from "react-hot-toast";

export async function loadProducts() {
  // const res = await fetch("https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/products", { cache: "no-store" });
  const res = await fetch("https://7dcb0rpwbd.execute-api.sa-east-1.amazonaws.com/ba18aa5a-5dc1-4f55-9d37-3f6d74016b05/products", { cache: "no-store" });

  const data = await res.json()
  return data
};

export async function deleteProduct(code) {
  var requestOptions = {
    method: 'DELETE',
    redirect: 'follow',
    Headers: {
      'Content-type': 'application-json'
    },
    cache: "no-store"
  };

  await fetch(`https://7dcb0rpwbd.execute-api.sa-east-1.amazonaws.com/ba18aa5a-5dc1-4f55-9d37-3f6d74016b05/products/${code}`, requestOptions)
    // await fetch(`https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/products/${code}`, requestOptions)
    .then(async response => {
      let res = await response.text()
      res = JSON.parse(res)
      if (res.statusOk) {
        toast.success("Producto eliminado exitosamente");
      } else {
        toast.error(res.message);
      };
    })
    .catch(error => console.log('error', error));
};

async function Products() {

  const products = await loadProducts();

  return (
    <ProductsPage products={products.products} />
  )
};

export default Products;