"use client";
import { GoToButton } from "@/components/common/buttons";
import { PAGES } from "@/constants";
import { Popup } from 'semantic-ui-react';
import { ButtonsContainer, Container, DataContainer, Label, Segment, SubContainer } from "./styles";

const ShowBrand = ({ brand }) => {
  return (
    <Container>
      <SubContainer>
        <DataContainer width="200px">
          <Label>Código</Label>
          <Segment>{brand?.id}</Segment>
        </DataContainer>
        <DataContainer width="200px">
          <Label>Nombre</Label>
          <Segment>{brand?.name}</Segment>
        </DataContainer>
      </SubContainer>
      <SubContainer>
        <DataContainer maxWidth="100%" >
          <Label>Comentarios</Label>
          <Segment>{brand.comments || "Sin Comentarios."}</Segment>
        </DataContainer>
      </SubContainer>
      <Popup
        size="tiny"
        content="Editar marca"
        position="top center"
        trigger={
          <ButtonsContainer>
            <GoToButton goTo={PAGES.BRANDS.UPDATE(brand.id)} iconName="edit" color="blue" />
          </ButtonsContainer>
        }
      />
    </Container>
  );
};

export default ShowBrand;
