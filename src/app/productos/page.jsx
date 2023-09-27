"use client"
import ProductsPage from "@/components/products/ProductsPage";

async function loadProducts() {
  const res = await fetch("https://v1zcj5c6i3.execute-api.sa-east-1.amazonaws.com/70133529-4833-48e2-b6de-bd9a8b8cfafc/products", { cache: "no-store" });
  const data = await res.json()
  return data
};

async function Products() {

  const products = await loadProducts();

  async function deleteProduct(code) {
    var requestOptions = {
      method: 'DELETE',
      redirect: 'follow',
      Headers: {
        'Content-type': 'application-json'
      },
      cache: "no-store"
    };

    await fetch(`https://v1zcj5c6i3.execute-api.sa-east-1.amazonaws.com/f222ba6b-b1f9-4ed8-b264-79418f7dfc22/products/${code}`, requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  };
  return (
    <ProductsPage deleteProduct={deleteProduct} products={products} />
  )
};

export default Products;