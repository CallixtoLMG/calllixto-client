"use client";
import { FieldsContainer, Form, FormField, Input, TextArea, ViewContainer } from "@/components/common/custom";
import { ContactView } from "@/components/common/form";

const SupplierView = ({ supplier }) => {
  return (
    <Form>
      <ViewContainer>
        <FieldsContainer>
          <FormField
            width="150px"
            label="Código"
            control={Input}
            value={supplier?.id}
            readOnly
          />
          <FormField
            width="40%"
            label="Nombre"
            control={Input}
            value={supplier?.name}
            readOnly
          />
        </FieldsContainer>
        <ContactView {...supplier} />
        <FormField
          control={TextArea}
          label="Comentarios"
          width="100%"
          placeholder="Comentarios"
          value={supplier?.comments}
          readOnly
        />
      </ViewContainer>
    </Form>
  )
};

export default SupplierView;
