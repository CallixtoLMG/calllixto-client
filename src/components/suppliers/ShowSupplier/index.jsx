"use client";
import { GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { formatedPhone } from "@/utils";
import { Popup } from 'semantic-ui-react';
import { ButtonsContainer, Container, DataContainer, Label, SubContainer } from "./styles";
import { Segment } from "@/components/common/custom";

const ShowSupplier = ({ supplier }) => {
  return (
    <Container>
      <SubContainer>
        <DataContainer >
          <Label>Código</Label>
          <Segment>{supplier?.id}</Segment>
        </DataContainer>
        <DataContainer width="50%">
          <Label>Nombre</Label>
          <Segment>{supplier?.name}</Segment>
        </DataContainer>
      </SubContainer>
      <SubContainer>
        <DataContainer >
          <Label>Teléfono</Label>
          <Segment>{formatedPhone(supplier.phone.areaCode, supplier.phone.number)}</Segment>
        </DataContainer>
        <DataContainer flex="1">
          <Label>Email</Label>
          <Segment>{supplier?.email}</Segment>
        </DataContainer>
        <DataContainer flex="1">
          <Label>Dirección</Label>
          <Segment>{supplier?.address}</Segment>
        </DataContainer>
      </SubContainer>
      <SubContainer>
        <DataContainer flex="1" >
          <Label>Comentarios</Label>
          <Segment>{supplier.comments || "Sin Comentarios."}</Segment>
        </DataContainer>
      </SubContainer>
      <Popup
        size="tiny"
        content="Editar proveedor"
        position="top center"
        trigger={
          <ButtonsContainer>
            <GoToButton goTo={PAGES.SUPPLIERS.UPDATE(supplier.id)} iconName="edit" color="blue" />
          </ButtonsContainer>
        }
      />
    </Container>
  );
};

export default ShowSupplier;
