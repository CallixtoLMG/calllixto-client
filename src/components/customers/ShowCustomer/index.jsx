"use client";
import { GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { formatedPhone } from "@/utils";
import { Popup } from 'semantic-ui-react';
import { ButtonsContainer, Container, DataContainer, Label, Segment, SubContainer } from "./styles";

const ShowCustomer = ({ customer = {} }) => {
  return (
    <Container>
      <SubContainer>
        <DataContainer width="330px">
          <Label>Nombre</Label>
          <Segment>{customer.name}</Segment>
        </DataContainer>
      </SubContainer>
      <SubContainer>
        <DataContainer>
          <Label>Mail</Label>
          <Segment>{customer.email}</Segment>
        </DataContainer>
        <DataContainer>
          <Label>Dirección</Label>
          <Segment>{customer.address || "Sin dato"}</Segment>
        </DataContainer>
        <DataContainer flex="none" width="200px">
          <Label>Teléfono</Label>
          <Segment>{formatedPhone(customer.phone.areaCode, customer.phone.number)}</Segment>
        </DataContainer>
      </SubContainer>
      <SubContainer>
        <DataContainer maxWidth="100%" >
          <Label>Comentarios</Label>
          <Segment>{customer.comments || "Sin comentarios."}</Segment>
        </DataContainer>
      </SubContainer>
      <Popup
        size="tiny"
        content="Editar cliente"
        position="top center"
        trigger={
          <ButtonsContainer>
            <GoToButton goTo={PAGES.CUSTOMERS.UPDATE(customer.id)} iconName="edit" color="blue" />
          </ButtonsContainer>
        }
      />
    </Container>
  );
};

export default ShowCustomer;
