"use client";
import { Grid } from "semantic-ui-react";
import { MainContainer, ModLabel, ModSegment } from "./styles";
import Loader from "@/components/layout/Loader";

const ShowCustomer = ({ customer = {}, isLoading }) => {
  return (
    <MainContainer>
      <Loader active={isLoading}>
        <Grid divided>
          <Grid.Row stretched>
            <Grid.Column>
              <ModLabel>Cliente</ModLabel>
              <ModSegment>{customer.name}</ModSegment>
              <ModLabel>Teléfono</ModLabel>
              <ModSegment>{customer.phone}</ModSegment>
              <ModLabel>Mail</ModLabel>
              <ModSegment>{customer.email}</ModSegment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Loader>
    </MainContainer>
  );
};

export default ShowCustomer;
