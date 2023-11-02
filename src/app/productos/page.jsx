import ProductsPage from "@/components/products/ProductsPage";
import { toast } from "react-hot-toast";

export async function loadProducts() {
  const res = await fetch("https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/products", { cache: "no-store" });

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

  await fetch(`https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/products/${code}`, requestOptions)
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