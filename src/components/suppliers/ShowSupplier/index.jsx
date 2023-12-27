"use client";
import { GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { Popup } from 'semantic-ui-react';
import { ButtonsContainer, Container, DataContainer, Label, Segment, SubContainer } from "./styles";

const ShowSupplier = ({ supplier }) => {
  return (
    <Container>
      <SubContainer>
        <DataContainer width="200px">
          <Label>Código</Label>
          <Segment>{supplier?.id}</Segment>
        </DataContainer>
        <DataContainer width="200px">
          <Label>Nombre</Label>
          <Segment>{supplier?.name}</Segment>
        </DataContainer>
      </SubContainer>
      <SubContainer>
        <DataContainer maxWidth="100%" >
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
