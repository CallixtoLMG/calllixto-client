import ProductForm from "@/components/products/ProductForm";

async function showProduct(code) {
  const res = await fetch(`https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/products/${code}`);
  const data = await res.json()
  return data
};

async function CreateProduct({ params }) {
  const product = await showProduct(params.code);

  return (
    <ProductForm product={product} />
  )
};

export default CreateProduct;

