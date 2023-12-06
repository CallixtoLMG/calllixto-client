"use client";
// import { useEffect } from "react";
import { PRODUCTSHEADERS } from "@/components/budgets/budgets.common";
import { modPrice, totalSum } from '@/utils';
import { get } from "lodash";
import { Grid, Table } from 'semantic-ui-react';
import { ClientDataContainer, CustomerDataContainer, DataContainer, Divider, HeaderContainer, ModGridColumn, ModImage, ModLabel, ModPayMethodHeader, ModPayMethodLabel, ModSegment, ModTable, ModTableCell, ModTableHeaderCell, ModTableLabel, ModTableRow, ModTitleHeader, PayMethodContainer, Sign } from "./styles";
import { Flex } from "rebass";

// import { PRODUCTSHEADERS } from "@/components/budgets/budgets.common";
// import { IVA, modDate, modPrice, totalIVA, totalSum } from '@/utils';
// import { Document, Font, PDFViewer, Page, StyleSheet, Text, View } from "@react-pdf/renderer";


const PDFfile = ({ budget }) => {
  console.log(budget)
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
          <ModSegment>20-34994199-7</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>IVA</ModLabel>
          <ModSegment>Responsable Inscripto</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>Dirección</ModLabel>
          <ModSegment>Ruta 14 km, Las Tapias, Córdoba.</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel> Teléfono </ModLabel>
          <ModSegment>{(get(budget, "customer.phone", ""))}</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>Vendedor/a</ModLabel>
          <ModSegment>Marcelo</ModSegment>
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
            <ModSegment>{(get(budget, "createdAt", ""))}</ModSegment>
          </DataContainer>
          <DataContainer width="120px">
            <ModLabel>N° presupuesto</ModLabel>
            <ModSegment>000005</ModSegment>
          </DataContainer>
        </Flex>
      </ClientDataContainer>
      <Grid >
        <Grid.Row stretched>
          <ModGridColumn>
            <ModTable celled compact>
              <Table.Header fullWidth>
                <ModTableRow>
                  <ModTableHeaderCell $header></ModTableHeaderCell>
                  {PRODUCTSHEADERS.map((header) => (
                    <ModTableHeaderCell $header key={header.id} >{header.name}</ModTableHeaderCell>
                  ))}
                </ModTableRow>
              </Table.Header>
              {budget?.products?.map((product, index) => (
                <Table.Body key={product.code}>
                  <ModTableRow >
                    <ModTableCell >{index + 1}</ModTableCell>
                    {PRODUCTSHEADERS
                      .filter(header => !header.hide)
                      .map((header) =>
                        <ModTableCell key={header.id}>
                          {header.modPrice ? modPrice(get(product, header.value, '')) : get(product, header.value, '')}
                        </ModTableCell>)
                    }
                  </ModTableRow>
                </Table.Body>
              ))}
              <Table.Footer>
                <Table.Row>
                  <ModTableHeaderCell align="right" colSpan='5'><strong>TOTAL</strong></ModTableHeaderCell>
                  <ModTableHeaderCell colSpan='1'><strong>{modPrice(totalSum(budget?.products))}</strong></ModTableHeaderCell>
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