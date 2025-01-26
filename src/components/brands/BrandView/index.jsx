"use client";
import { FieldsContainer, Form, ViewContainer } from "@/components/common/custom";
import { TextAreaField, TextField } from "@/components/common/form";

const BrandView = ({ brand }) => {
  return (
    <Form>
      <ViewContainer>
        <FieldsContainer>
          <TextField
            width="150px"
            label="Código"
            value={brand?.id}
          />
          <TextField
            width="40%"
            label="Nombre"
            value={brand?.name}
          />
        </FieldsContainer>
        <TextAreaField
          label="Comentarios"
          width="100%"
          value={brand?.comments}
        />
      </ViewContainer>
    </Form>
  )
};

export default BrandView;
