"use client";
import { formatedPhone } from "@/utils";
import { Container, DataContainer, Label, Segment, SubContainer } from "./styles";

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
    </Container>
  );
};

export default ShowCustomer;
