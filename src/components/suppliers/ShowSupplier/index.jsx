"use client";
import { Container, DataContainer, Label, Segment, SubContainer } from "./styles";

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
    </Container>
  );
};

export default ShowSupplier;
