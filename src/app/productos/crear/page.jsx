"use client";
import ProductForm from "@/components/products/ProductForm";
import { MainContainer } from "./styles";

const CreateProduct = () => {

  const create = (product) => {
    var requestOptions = {
      method: 'POST',
      body: JSON.stringify(product),
      redirect: "follow",
      Headers: {
        'Content-type': 'application-json'
      },
      cache: "no-store"
    };

    fetch("https://v1zcj5c6i3.execute-api.sa-east-1.amazonaws.com/70133529-4833-48e2-b6de-bd9a8b8cfafc/products", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  };

  return (
    <MainContainer>
      <ProductForm onSubmit={create} />
    </MainContainer>
  )
};

export default CreateProduct;