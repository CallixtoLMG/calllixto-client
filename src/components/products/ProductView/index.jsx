"use client";
import { IconnedButton } from "@/components/common/buttons";
import { FieldsContainer, FormField, IconedButton, Label, Price, Segment, ViewContainer } from "@/components/common/custom";
import { MEASSURE_UNITS } from "@/constants";
import { Icon } from "semantic-ui-react";

const ProductView = ({ product }) => {
  return (
    <ViewContainer>
      <FieldsContainer alignItems="flex-end">
        <FormField flex="1">
          <Label>Proveedor</Label>
          <Segment placeholder>{product?.supplierName}</Segment>
        </FormField>
        <FormField flex="1">
          <Label>Marca</Label>
          <Segment placeholder>{product?.brandName}</Segment>
        </FormField>
        <FormField width="20%">
          <IconnedButton icon="pencil" basic={!product?.editablePrice} disabled text="Precio Editable" />
        </FormField>
        <FormField width="20%">
          <IconnedButton icon="cut" basic={!product?.fractionConfig?.active} disabled text="Producto Fraccionable" />
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <FormField width="20%">
          <Label>Código</Label>
          <Segment placeholder>{product?.code}</Segment>
        </FormField>
        <FormField flex="1">
          <Label>Nombre</Label>
          <Segment placeholder>{product?.name}</Segment>
        </FormField>
        <FormField width="20%">
          <Label>Precio</Label>
          <Segment padding="10px 14px" height="40px" placeholder> <Price value={product?.price} /></Segment>
        </FormField>
        <FormField width="20%">
          <Label>Unidad de Medida</Label>
          <Segment placeholder>{MEASSURE_UNITS[product.fractionConfig?.unit?.toUpperCase()]?.text}</Segment>
        </FormField>
      </FieldsContainer>
      <FieldsContainer rowGap="5px">
        <Label>Comentarios</Label>
        <Segment placeholder>{product?.comments}</Segment>
      </FieldsContainer>
    </ViewContainer>
  );
};

export default ProductView;