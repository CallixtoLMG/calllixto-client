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
        <DataContainer >
          <Label>Código</Label>
          <Segment>{product?.code}</Segment>
        </DataContainer>
        <DataContainer flex="1">
          <Label>Nombre</Label>
          <Segment>{product?.name}</Segment>
        </DataContainer>
        <DataContainer >
          <Label>Precio</Label>
          <Segment>{formatedPrice(product?.price)}</Segment>
        </DataContainer>
      </SubContainer>
      <SubContainer>
        <DataContainer flex="1" >
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
