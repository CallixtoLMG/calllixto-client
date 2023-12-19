"use client";
import { formatedPrice } from "../../../utils";
import { DataContainer, ModLabel, ModSegment, SubContainer } from "./styles";

const ShowProduct = ({ product }) => {
  return (
    <SubContainer>
      <DataContainer>
        <ModLabel>Código</ModLabel>
        <ModSegment>{product?.code}</ModSegment>
      </DataContainer>
      <DataContainer>
        <ModLabel>Nombre</ModLabel>
        <ModSegment>{product?.name}</ModSegment>
      </DataContainer>
      <DataContainer>
        <ModLabel>Precio</ModLabel>
        <ModSegment>{formatedPrice(product?.price)}</ModSegment>
      </DataContainer>
    </SubContainer>
  );
};
export default ShowProduct;
