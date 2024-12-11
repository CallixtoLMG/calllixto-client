"use client";
import { Message } from "@/components/budgets/BudgetView/styles";
import { IconnedButton } from "@/components/common/buttons";
import { FieldsContainer, Flex, FormField, Label, MessageHeader, Price, Segment, ViewContainer } from "@/components/common/custom";
import { ICONS, MEASSURE_UNITS, PRODUCT_STATES } from "@/constants";
import { isItemInactive, threeMonthsDate } from "@/utils";

const ProductView = ({ product }) => {
  return (
    <ViewContainer>
      {isItemInactive(product?.state) && (
        <FieldsContainer>
          <Message negative>
            <MessageHeader>Motivo de inactivación</MessageHeader>
            <p>{product.inactiveReason}</p>
          </Message>
        </FieldsContainer>
      )}
      {product?.state === PRODUCT_STATES.DELETED.id && (
        <FieldsContainer>
          <Message negative>
            <p>
              Este producto se eliminará <b>PERMANENTEMENTE</b> de forma automática el día{" "}
              {threeMonthsDate(product.updateAt)} (90 días desde que se marcó como eliminado).
            </p>
          </Message>
        </FieldsContainer>
      )}
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
          <IconnedButton icon={ICONS.PENCIL} basic={!product?.editablePrice} disabled text="Precio Editable" />
        </FormField>
        <FormField width="20%">
          <IconnedButton icon={ICONS.CUT} basic={!product?.fractionConfig?.active} disabled text="Producto Fraccionable" />
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
          <Segment padding="10px 14px" height="40px" placeholder>
            <Price value={product?.price} />
          </Segment>
        </FormField>
        <FormField width="20%">
          <Label>Unidad de Medida</Label>
          <Segment placeholder>{MEASSURE_UNITS[product?.fractionConfig?.unit?.toUpperCase()]?.text}</Segment>
        </FormField>
      </FieldsContainer>
      <FieldsContainer rowGap="5px">
        <Label>Etiquetas</Label>
        <Segment height="50px">
          <Flex columnGap="5px">
            {product?.tags?.map((tag) => (
              <Label width="fit-content" key={tag.name} color={tag.color} >
                {tag.name}
              </Label>
            ))}
          </Flex>
        </Segment>
      </FieldsContainer>
      <FieldsContainer rowGap="5px">
        <Label>Comentarios</Label>
        <Segment placeholder>{product?.comments}</Segment>
      </FieldsContainer>
    </ViewContainer>
  );
};

export default ProductView;
