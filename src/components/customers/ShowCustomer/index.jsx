"use client";
import { Grid, Label, Segment } from 'semantic-ui-react';
import { MainContainer } from "./styles";

const ShowCustomer = ({ customer }) => {
  return (
    <MainContainer>

      <Grid divided>
        <Grid.Row stretched>
          <Grid.Column>
            <Label>Nombre del Cliente</Label>
            <Segment><p>{customer.name}</p></Segment>
            <Label> Teléfono </Label>
            <Segment> <p>{customer.phone}</p></Segment>
            <Label> Mail </Label>
            <Segment> <p>{customer.email}</p></Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </MainContainer>
  )
};

export default ShowCustomer;