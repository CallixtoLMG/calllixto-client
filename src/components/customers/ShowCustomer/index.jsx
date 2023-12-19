"use client";
import { DataContainer, ModLabel, ModSegment, SubContainer } from "./styles";

const ShowCustomer = ({ customer = {} }) => {
  if(customer.phone && customer.phone.areaCode ) {
    customer.phone.realPhone = Number(customer.phone.areaCode + customer.phone.number);
  };
  
  return (
    <SubContainer>
      <DataContainer>
        <ModLabel>Cliente</ModLabel>
        <ModSegment>{customer.name}</ModSegment></DataContainer>
      <DataContainer>
        <ModLabel>Teléfono</ModLabel>
        <ModSegment>{customer.phone.realPhone ? customer.phone.realPhone : customer.phone}</ModSegment></DataContainer>
      <DataContainer>
        <ModLabel>Mail</ModLabel>
        <ModSegment>{customer.email}</ModSegment></DataContainer>
    </SubContainer>
  );
};

export default ShowCustomer;
