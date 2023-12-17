"use client";
import Loader from "@/components/layout/Loader";
import PageHeader from "@/components/layout/PageHeader";
import { modPrice } from "../../../utils";
import { DataContainer, HeaderContainer, ModLabel, ModSegment, SubContainer } from "./styles";

const ShowProduct = ({ product, isLoading }) => {
  return (
    <>
      <Loader active={isLoading}>
        <HeaderContainer>
          <PageHeader title={"Detalle"} />
        </HeaderContainer>
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
            <ModSegment>{modPrice(product?.price)}</ModSegment>
          </DataContainer>
        </SubContainer>
      </Loader>
    </>
  );
};
export default ShowProduct;
