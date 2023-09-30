import ProductsPage from "@/components/products/ProductsPage";

async function loadProducts() {
  const res = await fetch("https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/products", { cache: "no-store" });
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

    await fetch(`https://v1zcj5c6i3.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/products/${code}`, requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  };

  return (
    <ProductsPage products={products} />
  )
};

export default Products;