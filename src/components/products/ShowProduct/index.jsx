"use client";
import { formatedPrice } from "@/utils";
import { Container, DataContainer, Label, Segment, SubContainer } from "./styles";

const ShowProduct = ({ product }) => {
  return (
    <Container>
      <SubContainer>
        <DataContainer maxWidth="350" width="300px" flex="none">
          <Label>Nombre</Label>
          <Segment>{product?.name}</Segment>
        </DataContainer>
        <DataContainer flex="none" width="200px">
          <Label>Código</Label>
          <Segment>{product?.code}</Segment>
        </DataContainer>
        <DataContainer flex="none" width="200px">
          <Label>Precio</Label>
          <Segment>{formatedPrice(product?.price)}</Segment>
        </DataContainer>
      </SubContainer>
      <SubContainer>
        <DataContainer maxWidth="100%" >
          <Label>Comentarios</Label>
          <Segment>{product.comments || "Sin Comentarios."}</Segment>
        </DataContainer>
      </SubContainer>
    </Container>
  );
};
export default ShowProduct;
