"use client";
import { Container, DataContainer, Label, Segment, SubContainer } from "./styles";

const ShowBRAND = ({ brand }) => {
  return (
    <Container>
      <SubContainer>
        <DataContainer maxWidth="350" width="300px" flex="none">
          <DataContainer flex="none" width="200px">
            <Label>Código</Label>
            <Segment>{brand?.id}</Segment>
          </DataContainer>
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
    </Container>
  );
};

export default ShowBRAND;
