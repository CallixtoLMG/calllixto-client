"use client";
import { PRODUCTS_COLUMNS } from "@/components/budgets/budgets.common";
import { formatedPrice, getTotalSum } from '@/utils';
import { get } from "lodash";
import { Flex } from "rebass";
import { Table } from 'semantic-ui-react';
import {
  ClientDataContainer,
  CustomerDataContainer,
  DataContainer,
  Divider,
  HeaderContainer,
  Image,
  Label,
  SubtleLabel,
  Segment,
  Cell,
  FooterCell,
  Title,
  Header,
  Sign,
  PayMethodsContainer
} from "./styles";
import dayjs from "dayjs";

const PDFfile = ({ budget, seller }) => {
  return (
    <>
      <HeaderContainer>
        <Title as="h1">MADERERA LAS TAPIAS</Title>
        <Image src="/Las Tapias.png" alt="Maderera logo" />
      </HeaderContainer>
      <Divider />
      <CustomerDataContainer>
        <DataContainer>
          <Label>CUIT</Label>
          <Segment>CUIT</Segment>
        </DataContainer>
        <DataContainer>
          <Label>IVA</Label>
          <Segment>IVA</Segment>
        </DataContainer>
        <DataContainer>
          <Label>Dirección</Label>
          <Segment>ADDRESS</Segment>
        </DataContainer>
        <DataContainer>
          <Label>Teléfono </Label>
          <Segment>PHONE</Segment>
        </DataContainer>
        <DataContainer>
          <Label>Vendedor/a</Label>
          <Segment>VENDEDOR</Segment>
        </DataContainer>
      </CustomerDataContainer>
      <Divider />
      <ClientDataContainer>
        <DataContainer width="250px">
          <Label>Cliente</Label>
          <Segment>{(get(budget, "customer.name", ""))}</Segment>
        </DataContainer>
        <Flex>
          <DataContainer width="120px">
            <Label>Fecha</Label>
            <Segment>{dayjs(budget?.createdAt).format('DD-MM-YYYY')}</Segment>
          </DataContainer>
          <DataContainer width="120px">
            <Label>Válido hasta</Label>
            <Segment>{dayjs(budget?.createdAt).add(10, 'day').format('DD-MM-YYYY')}</Segment>
          </DataContainer>
          <DataContainer width="120px">
            <Label>N°</Label>
            <Segment>{budget?.id}</Segment>
          </DataContainer>
        </Flex>
      </ClientDataContainer>
      <Flex marginTop="20px">
        <Table celled compact striped>
          <Table.Header fullWidth>
            <Table.Row>
              <Table.HeaderCell />
              {PRODUCTS_COLUMNS
                .map((column) => (
                  <Table.HeaderCell key={column.id} >{column.title}</Table.HeaderCell>
                ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {budget?.products?.map((product, index) => (
              <Table.Row key={product.code}>
                <Cell >{index + 1}</Cell>
                {PRODUCTS_COLUMNS
                  .map((column) =>
                    <Cell key={column.id}>
                      {column.value(product)}
                    </Cell>)
                }
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <FooterCell align="right" colSpan='6'><strong>TOTAL</strong></FooterCell>
              <Table.HeaderCell colSpan='1'><strong>{formatedPrice(getTotalSum(budget?.products))}</strong></Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </Flex>
      <Sign />
      <Flex alignItems="flex-start" padding="20px 0" wrap="wrap">
        <Header as="h3">Formas de pago</Header>
        <PayMethodsContainer>
          <SubtleLabel>Efectivo</SubtleLabel>
          <SubtleLabel>Transferencia Bancaria</SubtleLabel>
          <SubtleLabel>Tarjeta de débito</SubtleLabel>
          <SubtleLabel>Tarjeta de crédito</SubtleLabel>
          <SubtleLabel>Mercado Pago</SubtleLabel>
        </PayMethodsContainer>
      </Flex>
      {budget?.comments && (
        <Flex alignItems="flex-start">
          <Header as="h3">Observaciones</Header>
          <Flex marginLeft="15px">
            <SubtleLabel>{budget.comments}</SubtleLabel>
          </Flex>
        </Flex>
      )}
    </>
  )
}
export default PDFfile;