import ShowProduct from "@/components/products/ShowProduct";

async function showProduct(code) {
  const res = await fetch(`https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/products/${code}`);
  const data = await res.json()
  return data
};

async function Product({ params }) {
  const product = await showProduct(params.code);

  return (
    <ShowProduct product={product.product} />
  )
};

export default Product;