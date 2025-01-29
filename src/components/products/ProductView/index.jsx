"use client";
import { Message } from "@/components/budgets/BudgetView/styles";
import { IconedButton } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, ViewContainer } from "@/components/common/custom";
import { TextField, TextAreaField, PriceField } from "@/components/common/form";
import { ICONS, MEASSURE_UNITS, PRODUCT_STATES } from "@/constants";
import { getBrandCode, getDateWithOffset, getProductCode, getSupplierCode } from "@/utils";

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
        <FieldsContainer>
          <TextField width="25%" label="Proveedor" value={product?.supplierName} />
          <TextField width="25%" label="Marca" value={product?.brandName} />
          <TextField
            width="250px"
            label="Código"
            value={getProductCode(product?.code)}
            iconLabel={`${getSupplierCode(product?.code)} ${getBrandCode(product?.code)}`}
          />
        </FieldsContainer>
        <FieldsContainer>
          <TextField width="40%" label="Nombre" value={product?.name} />
        </FieldsContainer>
        <FieldsContainer alignItems="end">
          <PriceField width="200px" label="Precio" value={product?.price} />
          <FormField width="fit-content">
            <IconedButton
              height="38px"
              text="Precio Editable"
              icon={ICONS.PENCIL}
              basic={!product?.editablePrice}
              disabled
            />
          </FormField>
          <FormField width="fit-content">
            <IconedButton
              height="38px"
              icon={ICONS.CUT}
              basic={!product?.fractionConfig?.active}
              disabled
              text="Producto Fraccionable"
            />
          </FormField>
          <TextField
            width="200px"
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