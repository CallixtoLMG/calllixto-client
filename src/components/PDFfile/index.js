"use client";
// import { useEffect } from "react";
import { PRODUCTSHEADERS } from "@/components/budgets/budgets.common";
import { modPrice, totalSum } from '@/utils';
import { get } from "lodash";
import { Grid, Table } from 'semantic-ui-react';
import { ClientDataContainer, CustomerDataContainer, DataContainer, Divider, HeaderContainer, ModGridColumn, ModImage, ModLabel, ModPayMethodHeader, ModPayMethodLabel, ModSegment, ModTable, ModTableCell, ModTableHeaderCell, ModTableLabel, ModTableRow, ModTitleHeader, PayMethodContainer, Sign } from "./styles";

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
          <ModSegment>Responsable inscripto</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>Direccion</ModLabel>
          <ModSegment>Ruta 14 km, Las Tapias, Córdoba.</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel> Telefono </ModLabel>
          <ModSegment>{(get(budget, "customer.phone", ""))}</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>Vendedor/a</ModLabel>
          <ModSegment>Marcelo</ModSegment>
        </DataContainer>
      </CustomerDataContainer>
      <Divider />
      <ClientDataContainer>
        <DataContainer>
          <ModLabel>Nombre del cliente</ModLabel>
          <ModSegment>{(get(budget, "customer.name", ""))}</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>Presupuestado</ModLabel>
          <ModSegment>{(get(budget, "createdAt", ""))}</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>N° presupuesto</ModLabel>
          <ModSegment>000005</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>Vencimiento</ModLabel>
          <ModSegment>{(get(budget, "customer.phone", ""))}</ModSegment>
        </DataContainer>
      </ClientDataContainer>
      <Grid >
        <Grid.Row stretched>
          <ModGridColumn  >
            <ModTableLabel> Productos </ModTableLabel>
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
              <Table.Footer celled fullWidth>
                <Table.Row>
                  <ModTableHeaderCell />
                  <ModTableHeaderCell $center colSpan='1'><strong>Suma Total</strong></ModTableHeaderCell>
                  <ModTableHeaderCell colSpan='3' />
                  <ModTableHeaderCell $center colSpan='1'><strong>{modPrice(totalSum(budget?.products))}</strong></ModTableHeaderCell>
                </Table.Row>
              </Table.Footer>
            </ModTable>
          </ModGridColumn>
        </Grid.Row>
      </Grid>
      <Sign />
      <ModPayMethodHeader as="h2">Formas de pago:</ModPayMethodHeader>
      <PayMethodContainer>
        <ModPayMethodLabel>Efectivo</ModPayMethodLabel>
        <ModPayMethodLabel>Transferencia Bancaria</ModPayMethodLabel>
        <ModPayMethodLabel>Tarjeta de débito</ModPayMethodLabel>
        <ModPayMethodLabel>Tarjeta de crédito</ModPayMethodLabel>
        <ModPayMethodLabel>Mercado Pago</ModPayMethodLabel>
      </PayMethodContainer>
    </>
  )
}
export default PDFfile;