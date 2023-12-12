"use client";
import ButtonGoTo from "@/components/buttons/GoTo";
import Loader from "@/components/layout/Loader";
import { PAGES } from "@/constants";
import { Grid } from "semantic-ui-react";
import { ModLabel, ModSegment } from "./styles";

const ShowCustomer = ({ customer = {}, isLoading }) => {
  return (
    <>
      <Loader active={isLoading}>
        <ButtonGoTo goTo={PAGES.CUSTOMERS.BASE} iconName="chevron left" text="Volver atrás" color="green" />
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
    </>
  );
};

export default ShowCustomer;
