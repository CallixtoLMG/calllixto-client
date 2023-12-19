"use client";
import { DataContainer, ModLabel, ModSegment, SubContainer } from "./styles";

const ShowCustomer = ({ customer = {} }) => {
  return (
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
  );
};

export default ShowCustomer;
