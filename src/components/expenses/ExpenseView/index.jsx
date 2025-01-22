"use client";
import { FieldsContainer, FormField, Label, Message, MessageHeader, Segment, ViewContainer } from "@/components/common/custom";
import { isItemInactive } from "@/utils";

const ExpenseView = ({ expense }) => {
  return (
    <ViewContainer>
      {isItemInactive(expense?.state) &&
        <FieldsContainer>
          <Message negative >
            <MessageHeader>Motivo de inactivación</MessageHeader>
            <p>{expense.inactiveReason}</p>
          </Message>
        </FieldsContainer>}
      <FieldsContainer>
        <FormField>
          <Label>Código</Label>
          <Segment placeholder>{expense?.id}</Segment>
        </FormField>
        <FormField width="50%">
          <Label>Nombre</Label>
          <Segment placeholder>{expense?.name}</Segment>
        </FormField>
      </FieldsContainer>
      <FieldsContainer rowGap="5px">
        <Label>Comentarios</Label>
        <Segment placeholder>{expense?.comments}</Segment>
      </FieldsContainer>
    </ViewContainer>
  )
};

export default ExpenseView;
