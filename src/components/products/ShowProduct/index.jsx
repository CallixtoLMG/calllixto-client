"use client";
import ButtonGoTo from "@/components/buttons/GoTo";
import Loader from "@/components/layout/Loader";
import { PAGES } from "@/constants";
import { Grid } from "semantic-ui-react";
import { modPrice } from "../../../utils";
import { ModLabel, ModSegment } from "./styles";

const ShowProduct = ({ product, isLoading }) => {
  return (
    <>
      <Loader active={isLoading}>
        <ButtonGoTo goTo={PAGES.PRODUCTS.BASE} iconName="chevron left" text="Volver atrás" color="green" />
        <Grid divided>
          <Grid.Row stretched>
            <Grid.Column>
              <ModLabel>Codigo</ModLabel>
              <ModSegment>{product.code}</ModSegment>
              <ModLabel>Nombre</ModLabel>
              <ModSegment>{product.name}</ModSegment>
              <ModLabel>Precio</ModLabel>
              <ModSegment>{modPrice(product.price)}</ModSegment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Loader>
    </>
  );
};
export default ShowProduct;
