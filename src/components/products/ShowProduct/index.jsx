"use client";
import { Grid, Label, Segment } from 'semantic-ui-react';
import { MainContainer } from "./styles";

const ShowProduct = ({ product }) => {
  return (
    <MainContainer>

      <Grid divided>
        <Grid.Row stretched>
          <Grid.Column>
            <Label> Codigo </Label>
            <Segment><p>{product.code}</p></Segment>
            <Label>Nombre del Producto</Label>
            <Segment><p>{product.name}</p></Segment>
            <Label> Precio </Label>
            <Segment> <p>{product.price}</p></Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </MainContainer>
  )
};

export default ShowProduct;