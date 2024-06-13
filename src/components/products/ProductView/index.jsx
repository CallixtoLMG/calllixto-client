"use client";
import { FieldsContainer, ViewContainer, FormField, Label, RuledLabel, Segment } from "@/components/common/custom";
import { formatedPrice } from "@/utils";

const ProductView = ({ product }) => {
  return (
    <ViewContainer>
      <FieldsContainer>
        <FormField width="30%">
          <Label>Proveedor</Label>
          <Segment>{product?.supplierName}</Segment>
        </FormField>
        <FormField width="30%">
          <Label>Marca</Label>
          <Segment>{product?.brandName}</Segment>
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <FormField width="20%">
          <Label>Código</Label>
          <Segment>{product?.code}</Segment>
        </FormField>
        <FormField flex="1">
          <Label>Nombre</Label>
          <Segment>{product?.name}</Segment>
        </FormField>
        <FormField width="20%">
          <Label>Precio</Label>
          <Segment>{formatedPrice(product?.price)}</Segment>
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <Label>Comentarios</Label>
        <Segment>{product?.comments}</Segment>
      </FieldsContainer>
    </ViewContainer>
  );
};

export default ProductView;