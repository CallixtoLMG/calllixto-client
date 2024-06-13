"use client";
import { ViewContainer, FieldsContainer, FormField, Label, Segment } from "@/components/common/custom";

const SupplierView = ({ supplier }) => {
  return (
    <ViewContainer>
      <FieldsContainer>
        <FormField>
          <Label>Código</Label>
          <Segment>{supplier?.id}</Segment>
        </FormField>
        <FormField width="40%">
          <Label>Nombre</Label>
          <Segment>{supplier?.name}</Segment>
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <Label >Comentarios</Label>
        <Segment>{supplier?.comments}</Segment>
      </FieldsContainer>
    </ViewContainer>
  )
};

export default SupplierView;
