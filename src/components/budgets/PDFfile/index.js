"use client";
import { PRODUCTS_COLUMNS } from "@/components/budgets/budgets.common";
import { HeaderCell, Table } from '@/components/common/table';
import { formatedPhone, getTotalSum, simpleFormatedPrice } from "@/utils";
import dayjs from "dayjs";
import { get } from "lodash";
import { Flex } from "rebass";
import {
  ClientDataContainer,
  CustomerDataContainer,
  DataContainer,
  Divider,
  Header,
  HeaderContainer,
  Image,
  Label,
  PayMethodsContainer,
  Segment,
  SubtleLabel,
  Title
} from "./styles";

const PDFfile = ({ budget }) => {
  return (
    <table>
      <thead>
        <tr>
          <td>
            <HeaderContainer>
              <Title as="h1">MADERERA LAS TAPIAS</Title>
              <Image src="/Las Tapias.png" alt="Maderera logo" />
            </HeaderContainer>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div style={{ width: '80vw' }}>
              <ClientDataContainer>
                <DataContainer flex="2">
                  <Label>Vendedor/a</Label>
                  <Segment>VENDEDOR</Segment>
                </DataContainer>
                <DataContainer flex="1">
                  <Label>Fecha</Label>
                  <Segment>{dayjs(budget?.createdAt).format('DD-MM-YYYY')}</Segment>
                </DataContainer>
                <DataContainer flex="1">
                  <Label>Válido hasta</Label>
                  <Segment>{dayjs(budget?.createdAt).add(10, 'day').format('DD-MM-YYYY')}</Segment>
                </DataContainer>
                <DataContainer flex="1">
                  <Label>Presupuesto N°</Label>
                  <Segment>{budget?.id}</Segment>
                </DataContainer>
              </ClientDataContainer>
              <Divider />
              <CustomerDataContainer>
                <DataContainer flex="1">
                  <Label>CUIT</Label>
                  <Segment>CUIT</Segment>
                </DataContainer>
                <DataContainer flex="1">
                  <Label>IVA</Label>
                  <Segment>IVA</Segment>
                </DataContainer>
                <DataContainer flex="1">
                  <Label>Dirección</Label>
                  <Segment>ADDRESS</Segment>
                </DataContainer >
                <DataContainer flex="1">
                  <Label>Teléfono </Label>
                  <Segment>PHONE</Segment>
                </DataContainer>
              </CustomerDataContainer>
              <Divider />
              <ClientDataContainer>
                <DataContainer flex="2">
                  <Label>Cliente</Label>
                  <Segment>{(get(budget, "customer.name", ""))}</Segment>
                </DataContainer>
                <DataContainer flex="2">
                  <Label>Dirección</Label>
                  <Segment>{(get(budget, "customer.address", ""))}</Segment>
                </DataContainer>
                <DataContainer flex="1">
                  <Label>Teléfono</Label>
                  <Segment>{formatedPhone(get(budget, "customer.phone.areaCode", ""), get(budget, "customer.phone.number", ""))}</Segment>
                </DataContainer>
              </ClientDataContainer>
              <Flex margin="20px 0">
                <Table
                  headers={PRODUCTS_COLUMNS.filter((products) => !products.hide)}
                  elements={budget?.products}
                  customRow={
                    <>
                      <HeaderCell textAlign="right" colSpan={PRODUCTS_COLUMNS.filter((products) => !products.hide).length - 1}><strong>TOTAL</strong></HeaderCell>
                      <HeaderCell colSpan="1"><strong>{simpleFormatedPrice(getTotalSum(budget?.products))}</strong></HeaderCell>
                    </>
                  }
                />
              </Flex>
              <Divider />
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
                <DataContainer width="100%!important;">
                  <Label>Comentarios</Label>
                  <Segment marginTop="0!important;" minHeight="60px">{budget.comments}</Segment>
                </DataContainer>
              )}
            </div>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>
            <div></div>
          </td>
        </tr>
      </tfoot>
    </table>
  )
}
export default PDFfile;