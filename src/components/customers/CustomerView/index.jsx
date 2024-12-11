"use client";
import { FieldsContainer, Flex, FormField, Label, Message, MessageHeader, Segment, ViewContainer } from "@/components/common/custom";
import { ContactView } from "@/components/common/form";
import { isItemInactive } from "@/utils";

const CustomerView = ({ customer }) => {
  return (
    <ViewContainer>
      {isItemInactive(customer?.state) &&
        <FieldsContainer>
          <Message negative >
            <MessageHeader>Motivo de inactivación</MessageHeader>
            <p>{customer.inactiveReason}</p>
          </Message>
        </FieldsContainer>}
      <FieldsContainer>
        <FormField width="33%">
          <Label>Nombre</Label>
          <Segment placeholder>{customer?.name}</Segment>
        </FormField>
      </FieldsContainer>
      <ContactView {...customer} />
      <FieldsContainer rowGap="5px">
        <Label>Etiquetas</Label>
        <Segment>
          <Flex columnGap="5px">
            {customer?.tags?.map((tag) => (
              <Label width="fit-content" key={tag.name} color={tag.color}>
                {tag.name}
              </Label>
            ))}
          </Flex>
        </Segment>
      </FieldsContainer>
      <FieldsContainer rowGap="5px">
        <Label>Comentarios</Label>
        <Segment placeholder>{customer?.comments}</Segment>
      </FieldsContainer>
    </ViewContainer>
  )
};

export default CustomerView;
