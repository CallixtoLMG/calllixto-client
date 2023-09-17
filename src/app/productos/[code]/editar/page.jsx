"use client";
import { MainContainer } from "./styles";
import ProductForm from "@/components/products/ProductForm";

const CreateProduct = ({ params }) => {
  const product = {
    code: params.code,
    name: "Maderita",
    price: 150
  };

  return (
    <MainContainer>
      <ProductForm product={product} />
    </MainContainer>
  )
};

export default CreateProduct;