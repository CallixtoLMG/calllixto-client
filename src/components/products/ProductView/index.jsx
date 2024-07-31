"use client";
import { FieldsContainer, FormField, IconedButton, Label, Segment, ViewContainer } from "@/components/common/custom";
import { MEASSURE_UNITS } from "@/constants";
import { formatedPrice } from "@/utils";
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
          <IconedButton
            width="fit-content"
            icon
            labelPosition="left"
            color="blue"
            basic={!product?.editablePrice}
            disabled
          >
            <Icon name="pencil" />
            Precio Editable
          </IconedButton>
        </FormField>
        <FormField width="20%">
          <IconedButton
            width="fit-content"
            icon
            labelPosition="left"
            color="blue"
            basic={!product?.fractionConfig?.active}
            disabled
          >
            <Icon name="cut" />
            Producto Fraccionable
          </IconedButton>
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
          <Segment placeholder>{formatedPrice(product?.price)}</Segment>
        </FormField>
        <FormField width="20%">
          <Label>Unidad de Medida</Label>
          <Segment placeholder>{MEASSURE_UNITS[product.fractionConfig?.unit?.toUpperCase()]?.text}</Segment>
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <Label>Comentarios</Label>
        <Segment placeholder>{product?.comments}</Segment>
      </FieldsContainer>
    </ViewContainer>
  );
};

export default ProductView;