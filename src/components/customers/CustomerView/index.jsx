"use client";
import { Form, FormField, Input, TextArea, ViewContainer } from "@/components/common/custom";
import { ContactView } from "@/components/common/form";

const CustomerView = ({ customer }) => {
  return (
    <Form>
      <ViewContainer>
        <FormField
          width="40%"
          label="Nombre"
          control={Input}
          value={customer?.name}
          readOnly
        />
        <ContactView {...customer} />
        <FormField
          control={TextArea}
          label="Comentarios"
          width="100%"
          placeholder="Comentarios"
          value={customer?.comments}
          readOnly
        />
      </ViewContainer>
    </Form>
  )
};

export default CustomerView;
