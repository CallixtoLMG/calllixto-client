"use client";
import { Message } from "@/components/budgets/BudgetView/styles";
import { IconnedButton } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, ViewContainer } from "@/components/common/custom";
import { PriceField, TextField, TextAreaField } from "@/components/common/form";
import { ICONS, MEASSURE_UNITS, PRODUCT_STATES } from "@/constants";
import { getDateWithOffset } from "@/utils";

const ProductView = ({ product }) => {
  return (
    <Form>
      <ViewContainer>
        {product?.state === PRODUCT_STATES.DELETED.id && (
          <FieldsContainer>
            <Message negative>
              <p>Este producto se eliminará <b>PERMANENTEMENTE</b> de forma automática el día {getDateWithOffset(product.updateAt, 3, 'month')} (90 días desde que se marco como eliminado).</p>
            </Message>
          </FieldsContainer>
        )}
        <FieldsContainer alignItems="flex-end">
          <TextField flex="1" label="Proveedor" value={product?.supplierName} />
          <TextField flex="1" label="Marca" value={product?.brandName} />
          <FormField width="20%">
            <IconnedButton icon={ICONS.PENCIL} basic={!product?.editablePrice} disabled text="Precio Editable" />
          </FormField>
          <FormField width="20%">
            <IconnedButton icon={ICONS.CUT} basic={!product?.fractionConfig?.active} disabled text="Producto Fraccionable" />
          </FormField>
        </FieldsContainer>
        <FieldsContainer>
          <TextField width="20%" label="Código" value={product?.code} />
          <TextField flex="1" label="Nombre" value={product?.name} />
          <PriceField width="20%" label="Precio" value={product?.price} />
          <TextField
            width="20%"
            label="Unidad de Medida"
            value={MEASSURE_UNITS[product?.fractionConfig?.unit?.toUpperCase()]?.text}
          />
        </FieldsContainer>
        <TextAreaField
          label="Comentarios"
          width="100%"
          maxLength="2000"
          value={product?.comments}
        />
      </ViewContainer>
    </Form>
  );
};

export default ProductView;