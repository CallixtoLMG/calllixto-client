"use client";
import { FieldsContainer, FormField, Label, Message, MessageHeader, Segment, ViewContainer } from "@/components/common/custom";
import { isItemInactive } from "@/utils";

const BrandView = ({ brand }) => {
  return (
    <ViewContainer>
      {isItemInactive(brand?.state) &&
        <FieldsContainer>
          <Message negative >
            <MessageHeader>Motivo de inactivación</MessageHeader>
            <p>{brand.inactiveReason}</p>
          </Message>
        </FieldsContainer>}
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
