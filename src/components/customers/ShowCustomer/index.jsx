"use client";
import Loader from "@/components/layout/Loader";
import PageHeader from "@/components/layout/PageHeader";
import { DataContainer, HeaderContainer, ModLabel, ModSegment, SubContainer } from "./styles";

const ShowCustomer = ({ customer = {}, isLoading }) => {
  return (
    <>
      <Loader active={isLoading}>
        <HeaderContainer>
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
