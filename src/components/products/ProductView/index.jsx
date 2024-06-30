"use client";
import { Checkbox, FieldsContainer, FormField, Label, Segment, ViewContainer } from "@/components/common/custom";
import { MEASSURE_UNITS } from "@/constants";
import { formatedPrice } from "@/utils";

const ProductView = ({ product }) => {
  return (
    <ViewContainer>
      <FieldsContainer>
      <FormField width="250px">
          <Checkbox toggle checked={product?.fractionConfig?.active} label="Producto fraccionable" disabled />
        </FormField>
        <FormField >
          <Checkbox toggle checked={product?.editablePrice} label="Precio editable" disabled />
        </FormField>
      </FieldsContainer>
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
        {product?.fractionConfig?.active && (
          <FormField>
            <Label>Unidad de Medida</Label>
            <Segment>{MEASSURE_UNITS[product.fractionConfig.unit.toUpperCase()].text}</Segment>
          </FormField>
        )}
      </FieldsContainer>
      <FieldsContainer>
        <Label>Comentarios</Label>
        <Segment>{product?.comments}</Segment>
      </FieldsContainer>
    </ViewContainer>
  );
};

export default ProductView;