"use client";
// import { useEffect } from "react";
import { PRODUCTS_COLUMNS } from "@/components/budgets/budgets.common";
import { formatedPrice, totalSum } from '@/utils';
import { get } from "lodash";
import { Flex } from "rebass";
import { Grid, Table } from 'semantic-ui-react';
import { ClientDataContainer, CustomerDataContainer, DataContainer, Divider, HeaderContainer, ModGridColumn, ModImage, ModLabel, ModPayMethodHeader, ModPayMethodLabel, ModSegment, ModTable, ModTableCell, ModTableFooterCell, ModTableHeaderCell, ModTableRow, ModTitleHeader, PayMethodContainer, Sign } from "./styles";

const PDFfile = ({ budget, seller }) => {
  const dateOfIssue = (get(budget, "createdAt", ""))
  function sumDays(dateOfIssue, days) {
    let date = new Date(dateOfIssue);
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const dateOfExpiration = sumDays(dateOfIssue, 10)
  return (
    <>
      <HeaderContainer>
        <ModTitleHeader>MADERERA LAS TAPIAS</ModTitleHeader>
        <ModImage src={"/Las Tapias.png"} />
      </HeaderContainer>
      <Divider />
      <CustomerDataContainer>
        <DataContainer>
          <ModLabel>CUIT</ModLabel>
          <ModSegment>{(get(budget, "customer.cuit", ""))}</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>IVA</ModLabel>
          <ModSegment>{(get(budget, "customer.iva", ""))}</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>Dirección</ModLabel>
          <ModSegment>{(get(budget, "customer.address", ""))}</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel> Teléfono </ModLabel>
          <ModSegment>{(get(budget, "customer.phone", ""))}</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>Vendedor/a</ModLabel>
          <ModSegment>{(get(seller, "name", ""))}</ModSegment>
        </DataContainer>
      </CustomerDataContainer>
      <Divider />
      <ClientDataContainer>
        <DataContainer width="250px">
          <ModLabel>Cliente</ModLabel>
          <ModSegment>{(get(budget, "customer.name", ""))}</ModSegment>
        </DataContainer>
        <Flex>
          <DataContainer width="120px">
            <ModLabel>Fecha</ModLabel>
            <ModSegment>{(get(budget, "createdAt", ""))}</ModSegment>
          </DataContainer>
          <DataContainer width="120px">
            <ModLabel>Válido hasta</ModLabel>
            <ModSegment>{dateOfExpiration}</ModSegment>
          </DataContainer>
          <DataContainer width="120px">
            <ModLabel>N° presupuesto</ModLabel>
            <ModSegment>{(get(budget, "numberOf", ""))}</ModSegment>
          </DataContainer>
        </Flex>
      </ClientDataContainer>
      <Grid >
        <Grid.Row stretched>
          <ModGridColumn>
            <ModTable celled compact>
              <Table.Header fullWidth>
                <ModTableRow>
                  <ModTableHeaderCell ></ModTableHeaderCell>
                  {PRODUCTS_COLUMNS
                    .filter(header => !header.hide)
                    .map((header) => (
                      <ModTableHeaderCell key={header.id} >{header.name}</ModTableHeaderCell>
                    ))}
                </ModTableRow>
              </Table.Header>
              {budget?.products?.map((product, index) => (
                <Table.Body key={product.code}>
                  <ModTableRow >
                    <ModTableCell >{index + 1}</ModTableCell>
                    {PRODUCTS_COLUMNS
                      .filter(header => !header.hide)
                      .map((header) =>
                        <ModTableCell key={header.id}>
                          {header.formatedPrice ? formatedPrice(get(product, header.value, '')) : get(product, header.value, '')}
                        </ModTableCell>)
                    }
                  </ModTableRow>
                </Table.Body>
              ))}
              <Table.Footer>
                <Table.Row>
                  <ModTableFooterCell align="right" colSpan='5'><strong>TOTAL</strong></ModTableFooterCell>
                  <ModTableHeaderCell colSpan='1'><strong>{formatedPrice(totalSum(budget?.products))}</strong></ModTableHeaderCell>
                </Table.Row>
              </Table.Footer>
            </ModTable>
          </ModGridColumn>
        </Grid.Row>
      </Grid>
      <Sign />
      <Flex alignItems="flex-start">
        <ModPayMethodHeader as="h3">Formas de pago:</ModPayMethodHeader>
        <PayMethodContainer>
          <ModPayMethodLabel>Efectivo</ModPayMethodLabel>|
          <ModPayMethodLabel>Transferencia Bancaria</ModPayMethodLabel>|
          <ModPayMethodLabel>Tarjeta de débito</ModPayMethodLabel>|
          <ModPayMethodLabel>Tarjeta de crédito</ModPayMethodLabel>|
          <ModPayMethodLabel>Mercado Pago</ModPayMethodLabel>
        </PayMethodContainer>
      </Flex>
    </>
  )
}
export default PDFfile;