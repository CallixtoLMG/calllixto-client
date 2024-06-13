"use client";
import { FieldsContainer, FormField, Label, Segment, ViewContainer } from "@/components/common/custom";

const BrandView = ({ brand }) => {
  return (
    <ViewContainer>
      <FieldsContainer>
        <FormField>
          <Label>Código</Label>
          <Segment>{brand?.id}</Segment>
        </FormField>
        <FormField width="50%">
          <Label>Nombre</Label>
          <Segment>{brand?.name}</Segment>
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <Label>Comentarios</Label>
        <Segment>{brand?.comments}</Segment>
      </FieldsContainer>
    </ViewContainer>
  )
};

export default BrandView;
