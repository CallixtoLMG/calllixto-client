"use client";
import { Message } from "@/components/budgets/BudgetView/styles";
import { IconnedButton } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, Input, TextArea, ViewContainer } from "@/components/common/custom";
import { PriceField } from "@/components/common/form";
import { ICONS, MEASSURE_UNITS, PRODUCT_STATES } from "@/constants";
import { threeMonthsDate } from "@/utils";

const ProductView = ({ product }) => {
  return (
    <Form>
      <ViewContainer>
        {product?.state === PRODUCT_STATES.DELETED.id && (
          <FieldsContainer>
            <Message negative>
              <p>Este producto se eliminará <b>PERMANENTEMENTE</b> de forma automática el día {threeMonthsDate(product.updateAt)} (90 días desde que se marco como eliminado).</p>
            </Message>
          </FieldsContainer>
        )}
        <FieldsContainer alignItems="flex-end">
          <FormField flex="1" label="Proveedor" control={Input} value={product?.supplierName} readOnly />
          <FormField flex="1" label="Marca" control={Input} value={product?.brandName} readOnly />
          <FormField width="20%">
            <IconnedButton icon={ICONS.PENCIL} basic={!product?.editablePrice} disabled text="Precio Editable" />
          </FormField>
          <FormField width="20%">
            <IconnedButton icon={ICONS.CUT} basic={!product?.fractionConfig?.active} disabled text="Producto Fraccionable" />
          </FormField>
        </FieldsContainer>
        <FieldsContainer>
          <FormField width="20%" label="Código" control={Input} value={product?.code} readOnly />
          <FormField flex="1" label="Nombre" control={Input} value={product?.name} readOnly />
          <PriceField width="20%"  label="Precio" value={product?.price} />
          <FormField
            width="20%"
            label="Unidad de Medida"
            control={Input}
            value={MEASSURE_UNITS[product?.fractionConfig?.unit?.toUpperCase()]?.text}
            readOnly
          />
        </FieldsContainer>
        <FormField
          control={TextArea}
          label="Comentarios"
          width="100%"
          maxLength="2000"
          placeholder="Comentarios"
          readOnly
          value={product?.comments}
        />
      </ViewContainer>
    </Form>
  );
};

export default ProductView;