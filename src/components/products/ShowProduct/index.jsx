"use client";
import Back from "@/components/layout/Back";
import { Container } from 'semantic-ui-react';
import { MainContainer } from "./styles";

const ShowProduct = ({ product }) => {
  return (
    <MainContainer>
      <Container>
        <Back />
      </Container>
      <Container>
        <p>{product.code}</p>
        <p>{product.name}</p>
        <p>{product.price}</p>
      </Container>
    </MainContainer>
  )
};

export default ShowProduct;