"use client";
import { PRODUCTS_COLUMNS } from "@/components/budgets/budgets.common";
import { Cell, HeaderCell } from '@/components/common/table';
import { BUDGET_PDF_FORMAT } from "@/constants";
import { formatedPercentage, formatedPricePdf, formatedSimplePhone } from "@/utils";
import dayjs from "dayjs";
import { get } from "lodash";
import { useMemo } from "react";
import { Flex } from "rebass";
import { Header, Table } from "semantic-ui-react";
import {
  ClientDataContainer,
  CustomerDataContainer,
  DataContainer,
  Divider,
  HeaderContainer,
  Image,
  Label,
  Segment,
  TableRowHeader,
  Title
} from "./styles";

const PDFfile = ({ budget, total, client, printPdfMode }) => {
  const clientPdf = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.CLIENT, [printPdfMode]);
  const dispatchPdf = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.DISPATCH, [printPdfMode]);
  const filteredColumns = useMemo(() => PRODUCTS_COLUMNS(dispatchPdf, budget), [budget, dispatchPdf]);

  return (
    <table>
      <thead>
        <tr>
          <td>
            <HeaderContainer>
              <Title as="h2">MADERERA LAS TAPIAS</Title>
              {dispatchPdf && <Title as="h3">Remito</Title>}
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
                <DataContainer width="250px">
                  <Label>Vendedor/a</Label>
                  <Segment>{budget?.seller}</Segment>
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
              {clientPdf &&
                <>
                  <Divider />
                  <CustomerDataContainer>
                    <Flex>
                      <DataContainer width="250px">
                        <Label>CUIT</Label>
                        <Segment>{client?.cuil}</Segment>
                      </DataContainer>
                      <DataContainer flex="1">
                        <Label>IVA</Label>
                        <Segment>{client?.iva}</Segment>
                      </DataContainer>
                    </Flex>
                    <Flex>
                      <DataContainer width="250px">
                        <Label>Dirección</Label>
                        <Segment>{client?.addresses?.[0].address}</Segment>
                      </DataContainer>
                      <DataContainer flex="1">
                        <Label>Teléfonos</Label>
                        <Segment flexHeight>
                          <Flex flexDirection="column">
                            {client?.phoneNumbers?.map(formatedSimplePhone).join(' | ')}
                          </Flex>
                        </Segment>
                      </DataContainer>
                    </Flex>
                  </CustomerDataContainer>
                </>
              }
              <Divider />
              <ClientDataContainer>
                <DataContainer width="250px">
                  <Label>Cliente</Label>
                  <Segment>{(get(budget, "customer.name", ""))}</Segment>
                </DataContainer>
                <DataContainer flex="1">
                  <Label>Dirección</Label>
                  <Segment>{(get(budget, "customer.addresses[0].address", ""))}</Segment>
                </DataContainer>
                <DataContainer flex="1">
                  <Label>Teléfono</Label>
                  <Segment>{formatedSimplePhone(get(budget, "customer.phoneNumbers[0]"))}</Segment>
                </DataContainer>
              </ClientDataContainer>
              <Flex margin="20px 0">
                <Table celled compact striped>
                  <Table.Body>
                    <TableRowHeader>
                      {filteredColumns.map((header) => (
                        <HeaderCell key={`header_${header.id}`}>{header.title}</HeaderCell>
                      ))}
                    </TableRowHeader>
                    {budget?.products?.map((product) => {
                      return (
                        <Table.Row key={product.key}>
                          {filteredColumns.map(header => (
                            <Cell key={`cell_${header.id}`} align={header.align} width={header.width} wrap={header.wrap}>
                              {header?.value(product)}
                            </Cell>
                          ))}
                        </Table.Row>
                      );
                    })}
                    {!dispatchPdf && (
                      <>
                        {!!budget?.globalDiscount &&
                          <Table.Row>
                            <Cell right textAlign="right" colSpan={filteredColumns.length - 1}><strong>DESCUENTO GLOBAL</strong></Cell>
                            <Cell colSpan="1"><strong>{formatedPercentage(budget?.globalDiscount)}</strong></Cell>
                          </Table.Row>
                        }
                        <Table.Row>
                          <Cell right textAlign="right" colSpan={filteredColumns.length - 1}><strong>TOTAL</strong></Cell>
                          <Cell colSpan="1"><strong>{formatedPricePdf(total)}</strong></Cell>
                        </Table.Row>
                      </>
                    )}
                  </Table.Body>
                </Table>
              </Flex>
              {budget?.comments && (
                <DataContainer width="100%">
                  <Label>Comentarios</Label>
                  <Segment marginTop="0" minHeight="60px">{budget.comments}</Segment>
                </DataContainer>
              )}
              {!dispatchPdf &&
                <>
                  <Divider borderless />
                  <DataContainer width="100%">
                    <Label >Formas de pago</Label>
                    <Segment marginTop="0">
                      {budget?.paymentMethods?.join(" | ")}
                    </Segment>
                  </DataContainer>
                </>
              }
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