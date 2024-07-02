"use client";
import { FieldsContainer, FormField, Label, Segment, ViewContainer } from "@/components/common/custom";
import { ContactView } from "@/components/common/form";

const CustomerView = ({ customer }) => {
  return (
    <ViewContainer>
      <FieldsContainer>
        <FormField width="33%">
          <Label>Nombre</Label>
          <Segment>{customer?.name}</Segment>
        </FormField>
      </FieldsContainer>
      <ContactView {...customer} />
      <FieldsContainer>
        <Label>Comentarios</Label>
        <Segment>{customer?.comments}</Segment>
      </FieldsContainer>
    </ViewContainer>
  )
};

export default CustomerView;
