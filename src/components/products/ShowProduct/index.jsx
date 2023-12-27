"use client";
import { GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { formatedPrice } from "@/utils";
import { Popup } from 'semantic-ui-react';
import { ButtonsContainer, Container, DataContainer, Label, Segment, SubContainer } from "./styles";

const ShowProduct = ({ product }) => {
  return (
    <Container>
      <SubContainer>
        <DataContainer flex="none" width="200px">
          <Label>Código</Label>
          <Segment>{product?.code}</Segment>
        </DataContainer>
        <DataContainer maxWidth="350" width="300px" flex="none">
          <Label>Nombre</Label>
          <Segment>{product?.name}</Segment>
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
      <Popup
        size="tiny"
        content="Editar producto"
        position="top center"
        trigger={
          <ButtonsContainer>
            <GoToButton goTo={PAGES.PRODUCTS.UPDATE(product.code)} iconName="edit" color="blue" />
          </ButtonsContainer>
        }
      />
    </Container>
  );
};
export default ShowProduct;
