"use client";
import { FieldsContainer, Form, FormField, Input, TextArea, ViewContainer } from "@/components/common/custom";

const BrandView = ({ brand }) => {
  return (
    <Form>
      <ViewContainer>
        <FieldsContainer>
          <FormField
            width="150px"
            label="Código"
            control={Input}
            value={brand?.id}
            readOnly
          />
          <FormField
            width="40%"
            label="Nombre"
            control={Input}
            value={brand?.name}
            readOnly
          />
        </FieldsContainer>
        <FormField
          control={TextArea}
          label="Comentarios"
          width="100%"
          placeholder="Comentarios"
          value={brand?.comments}
          readOnly
        />
      </ViewContainer>
    </Form>
  )
};

export default BrandView;
