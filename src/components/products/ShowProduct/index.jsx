"use client";
import { Grid } from "semantic-ui-react";
import { modPrice } from "../../../utils";
import { MainContainer, ModLabel, ModSegment } from "./styles";
import Loader from "@/components/layout/Loader";

const ShowProduct = ({ product, isLoading }) => {
  return (
    <MainContainer>
      <Loader active={isLoading}>
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
    </MainContainer>
  );
};
export default ShowProduct;
