"use client";
import { GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { formatedPrice } from "@/utils";
import { Popup } from 'semantic-ui-react';
import { ButtonsContainer, Container, DataContainer, Label, SubContainer } from "./styles";
import { Segment } from "@/components/common/forms";

const ShowProduct = ({ product }) => {
  return (
    <Container>
      <SubContainer>
        <DataContainer >
          <Label>Proveedor</Label>
          <Segment>{product?.supplier}</Segment>
        </DataContainer>
        <DataContainer >
          <Label>Marca</Label>
          <Segment>{product?.brand}</Segment>
        </DataContainer>
      </SubContainer>
      <SubContainer>
        <DataContainer >
          <Label>Código</Label>
          <Segment>{product?.code}</Segment>
        </DataContainer>
        <DataContainer >
          <Label>Código del proveedor</Label>
          <Segment>{product?.supplierCode}</Segment>
        </DataContainer>
      </SubContainer>
      <SubContainer>
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
    </Container >
  );
};
export default ShowProduct;
