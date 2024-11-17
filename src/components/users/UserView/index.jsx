"use client";
import { FieldsContainer, FormField, Label, Message, MessageHeader, Segment, ViewContainer } from "@/components/common/custom";
import { isItemInactive } from "@/utils";

const UserView = ({ user }) => {
  return (
    <ViewContainer>
      {isItemInactive(user?.state) && (
        <FieldsContainer>
          <Message negative>
            <MessageHeader>Motivo de inactivación</MessageHeader>
            <p>{user?.inactiveReason}</p>
          </Message>
        </FieldsContainer>
      )}
      <FieldsContainer>
        <FormField flex="3">
          <Label>Nombre</Label>
          <Segment placeholder>{user?.firstName}</Segment>
        </FormField>
        <FormField flex="3">
          <Label>Apellido</Label>
          <Segment placeholder>{user?.lastName}</Segment>
        </FormField>
        <FormField flex="1">
          <Label>Rol</Label>
          <Segment placeholder>{user?.role}</Segment>
        </FormField>
        <FormField flex="2">
          <Label>Fecha de Nacimiento</Label>
          <Segment placeholder>
            {user?.birthDate ? new Date(user?.birthDate).toLocaleDateString() : "Sin fecha"}
          </Segment>
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <FormField flex="3">
          <Label>Teléfonos</Label>
          <Segment placeholder>
            {user?.phoneNumbers?.length ? user.phoneNumbers.join(", ") : "No hay teléfonos"}
          </Segment>
        </FormField>
        <FormField flex="3">
          <Label>Direcciones</Label>
          <Segment placeholder>
            {user?.addresses?.length ? user.addresses.join(", ") : "No hay direcciones"}
          </Segment>
        </FormField>
        <FormField flex="3">
          <Label>Correos Electrónicos</Label>
          <Segment placeholder>
            {user?.emails?.length ? user.emails.join(", ") : "No hay correos"}
          </Segment>
        </FormField>
      </FieldsContainer>
      <FieldsContainer rowGap="5px">
        <Label>Comentarios</Label>
        <Segment placeholder>{user?.comments || "No hay comentarios"}</Segment>
      </FieldsContainer>
    </ViewContainer>
  );
};

export default UserView;
