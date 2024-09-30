"use client";
import { FieldsContainer, FormField, Label, Segment, ViewContainer } from "@/components/common/custom";

const BrandView = ({ brand }) => {
  return (
    <ViewContainer>
      <FieldsContainer>
        <FormField>
          <Label>Código</Label>
          <Segment placeholder>{brand?.id}</Segment>
        </FormField>
        <FormField width="50%">
          <Label>Nombre</Label>
          <Segment placeholder>{brand?.name}</Segment>
        </FormField>
      </FieldsContainer>
      <FieldsContainer rowGap="5px">
        <Label>Comentarios</Label>
        <Segment placeholder>{brand?.comments}</Segment>
      </FieldsContainer>
    </ViewContainer>
  )
};

export default BrandView;
