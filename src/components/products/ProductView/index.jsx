"use client";
import { IconnedButton } from "@/components/common/buttons";
import { FieldsContainer, FormField, Label, Price, Segment, ViewContainer } from "@/components/common/custom";
import { MEASSURE_UNITS, PRODUCTS_STATES } from "@/constants";

const ProductView = ({ product }) => {
  console.log("productView", product)
  return (
    <ViewContainer>
      <FieldsContainer>
        <IconnedButton
          text={product.state === PRODUCTS_STATES.OOS.id ? "Sin stock" : "En stock"}
          icon={product.state === PRODUCTS_STATES.OOS.id ? "x" : "box"}
          basic={product.state === PRODUCTS_STATES.OOS.id}
          color="orange"
          disabled
        />

        {product.state === PRODUCTS_STATES.INACTIVE.id &&
          <IconnedButton
            text={PRODUCTS_STATES.INACTIVE.id ? "Inactivo" : "Activo"}
            icon={PRODUCTS_STATES.INACTIVE.id ? "stop circle" : "play circle"}
            basic={!PRODUCTS_STATES.INACTIVE.id}
            color="grey"
            disabled
          />}

        {product.state === PRODUCTS_STATES.DELETED.id &&
          <IconnedButton
            text={PRODUCTS_STATES.DELETED.id ? "Borrado" : "Recuperar"}
            icon={PRODUCTS_STATES.DELETED.id ? "ban" : "undo"}
            basic={!PRODUCTS_STATES.DELETED.id}
            color="red"
            disabled
          />}
      </FieldsContainer>
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