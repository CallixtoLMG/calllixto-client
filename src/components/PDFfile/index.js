"use client";
import { PRODUCTS_COLUMNS } from "@/components/budgets/budgets.common";
import { formatedPrice, getTotalSum } from '@/utils';
import { get } from "lodash";
import { Flex } from "rebass";
import { Table } from 'semantic-ui-react';
import { ClientDataContainer, CustomerDataContainer, DataContainer, Divider, HeaderContainer, ModGridColumn, ModImage, ModLabel, ModPayMethodHeader, ModPayMethodLabel, ModSegment, ModTableCell, ModTableFooterCell, ModTableHeaderCell, ModTableRow, ModTitleHeader, PayMethodContainer, Sign } from "./styles";
import dayjs from "dayjs";

const PDFfile = ({ budget, seller }) => {
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
          <ModSegment>CUIT</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>IVA</ModLabel>
          <ModSegment>IVA</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>Dirección</ModLabel>
          <ModSegment>ADDRESS</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>Teléfono </ModLabel>
          <ModSegment>PHONE</ModSegment>
        </DataContainer>
        <DataContainer>
          <ModLabel>Vendedor/a</ModLabel>
          <ModSegment>VENDEDOR</ModSegment>
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
            <ModSegment>{dayjs(budget?.createdAt).format('DD-MM-YYYY')}</ModSegment>
          </DataContainer>
          <DataContainer width="120px">
            <ModLabel>Válido hasta</ModLabel>
            <ModSegment>{dayjs(budget?.createdAt).add(10, 'day').format('DD-MM-YYYY')}</ModSegment>
          </DataContainer>
          <DataContainer width="120px">
            <ModLabel>N°</ModLabel>
            <ModSegment>{budget?.id}</ModSegment>
          </DataContainer>
        </Flex>
      </ClientDataContainer>
      <ModGridColumn>
        <Table celled compact striped>
          <Table.Header fullWidth>
            <ModTableRow>
              <ModTableHeaderCell ></ModTableHeaderCell>
              {PRODUCTS_COLUMNS
                .map((column) => (
                  <ModTableHeaderCell key={column.id} >{column.title}</ModTableHeaderCell>
                ))}
            </ModTableRow>
          </Table.Header>
          <Table.Body>
            {budget?.products?.map((product, index) => (
              <ModTableRow key={product.code}>
                <ModTableCell >{index + 1}</ModTableCell>
                {PRODUCTS_COLUMNS
                  .map((column) =>
                    <ModTableCell key={column.id}>
                      {column.value(product)}
                    </ModTableCell>)
                }
              </ModTableRow>
            ))}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <ModTableFooterCell align="right" colSpan='6'><strong>TOTAL</strong></ModTableFooterCell>
              <ModTableHeaderCell colSpan='1'><strong>{formatedPrice(getTotalSum(budget?.products))}</strong></ModTableHeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </ModGridColumn>
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