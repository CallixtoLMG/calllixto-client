"use client";
import ButtonGoTo from "@/components/buttons/GoTo";
import Loader from "@/components/layout/Loader";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { DataContainer, HeaderContainer, ModLabel, ModSegment, SubContainer } from "./styles";

const ShowCustomer = ({ customer = {}, isLoading }) => {
  return (
    <>
      <Loader active={isLoading}>
        <HeaderContainer>
          <ButtonGoTo goTo={PAGES.CUSTOMERS.BASE} iconName="chevron left" text="Volver atrás" color="green" />
          <PageHeader title={"Detalle"} />
        </HeaderContainer>
        <SubContainer>
          <DataContainer>
            <ModLabel>Cliente</ModLabel>
            <ModSegment>{customer.name}</ModSegment></DataContainer>
          <DataContainer>
            <ModLabel>Teléfono</ModLabel>
            <ModSegment>{customer.phone}</ModSegment></DataContainer>
          <DataContainer>
            <ModLabel>Mail</ModLabel>
            <ModSegment>{customer.email}</ModSegment></DataContainer>
        </SubContainer>
      </Loader>
    </>
  );
};

export default ShowCustomer;
