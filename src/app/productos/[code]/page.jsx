import ShowProduct from "@/components/products/ShowProduct";

async function showProduct(code) {
  const res = await fetch(`https://v1zcj5c6i3.execute-api.sa-east-1.amazonaws.com/70133529-4833-48e2-b6de-bd9a8b8cfafc/products/${code}`);
  const data = await res.json()
  return data
};

async function Product({ params }) {
  const product = await showProduct(params.code);

  return (
    <ShowProduct product={product} />
  )
};

export default Product;