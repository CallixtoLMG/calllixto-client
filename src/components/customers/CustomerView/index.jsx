"use client";
import { Form, ViewContainer } from "@/components/common/custom";
import { ContactView, TextAreaField, TextField } from "@/components/common/form";

const CustomerView = ({ customer }) => {
  return (
    <Form>
      <ViewContainer>
        <TextField
          width="40%"
          label="Nombre"
          value={customer?.name}
        />
        <ContactView {...customer} />
        <TextAreaField
          label="Comentarios"
          width="100%"
          value={customer?.comments}
        />
      </ViewContainer>
    </Form>
  )
};

export default CustomerView;
