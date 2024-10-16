"use client";
import { FieldsContainer, FormField, Label, Message, MessageHeader, Segment, ViewContainer } from "@/components/common/custom";
import { ContactView } from "@/components/common/form";
import { isItemInactive } from "@/utils";

const SupplierView = ({ supplier }) => {
  return (
    <ViewContainer>
      {isItemInactive(supplier?.state) &&
        <FieldsContainer>
          <Message negative >
            <MessageHeader>Motivo de inactivación</MessageHeader>
            <p>{supplier.inactiveReason}</p>
          </Message>
        </FieldsContainer>}
      <FieldsContainer>
        <FormField>
          <Label>Código</Label>
          <Segment placeholder>{supplier?.id}</Segment>
        </FormField>
        <FormField width="40%">
          <Label>Nombre</Label>
          <Segment placeholder>{supplier?.name}</Segment>
        </FormField>
      </FieldsContainer>
      <ContactView {...supplier} />
      <FieldsContainer rowGap="5px">
        <Label >Comentarios</Label>
        <Segment placeholder>{supplier?.comments}</Segment>
      </FieldsContainer>
    </ViewContainer>
  )
};

export default SupplierView;
