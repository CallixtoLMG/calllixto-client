import ProductForm from "@/components/products/ProductForm";
import { MainContainer } from "./styles";

async function showProduct(code) {
  const res = await fetch(`https://v1zcj5c6i3.execute-api.sa-east-1.amazonaws.com/12345/products/${code}/editar`);
  const data = await res.json()
  return data
};

async function CreateProduct({ params }) {
  const product = await showProduct(params.code);

  return (
    <MainContainer>
      <ProductForm product={product} />
    </MainContainer>
  )
};

export default CreateProduct;

