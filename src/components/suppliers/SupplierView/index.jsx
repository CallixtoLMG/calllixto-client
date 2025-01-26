"use client";
import { FieldsContainer, Form, ViewContainer } from "@/components/common/custom";
import { ContactView, TextAreaField, TextField } from "@/components/common/form";

const SupplierView = ({ supplier }) => {
  return (
    <Form>
      <ViewContainer>
        <FieldsContainer>
          <TextField
            width="150px"
            label="Código"
            value={supplier?.id}
          />
          <TextField
            width="40%"
            label="Nombre"
            value={supplier?.name}
          />
        </FieldsContainer>
        <ContactView {...supplier} />
        <TextAreaField
          label="Comentarios"
          width="100%"
          value={supplier?.comments}
        />
      </ViewContainer>
    </Form>
  )
};

export default SupplierView;
