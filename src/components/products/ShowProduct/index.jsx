"use client";
import ButtonGoTo from "@/components/buttons/GoTo";
import Loader from "@/components/layout/Loader";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { modPrice } from "../../../utils";
import { DataContainer, HeaderContainer, ModLabel, ModSegment, SubContainer } from "./styles";

const ShowProduct = ({ product, isLoading }) => {
  console.log(product)
  return (
    <>
      <Loader active={isLoading}>
        <HeaderContainer>
          <ButtonGoTo goTo={PAGES.PRODUCTS.BASE} iconName="chevron left" text="Volver atrás" color="green" />
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
