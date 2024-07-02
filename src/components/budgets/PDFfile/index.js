import { PRODUCTS_COLUMNS } from "@/components/budgets/budgets.common";
import { Price } from "@/components/common/custom";
import { Cell, HeaderCell } from '@/components/common/table';
import { BUDGET_PDF_FORMAT } from "@/constants";
import { formatedPercentage, formatedSimplePhone, getSubtotal, isBudgetCancelled } from "@/utils";
import dayjs from "dayjs";
import { get } from "lodash";
import { useMemo } from "react";
import { Box, Flex } from "rebass";
import { List, Table } from "semantic-ui-react";
import {
  ClientDataContainer,
  DataContainer,
  Divider,
  HeaderContainer,
  HeaderLabel,
  Image,
  Label,
  Segment,
  TableRowHeader,
  Title
} from "./styles";

const PDFfile = ({ budget, subtotal, client, printPdfMode, id }) => {
  const clientPdf = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.CLIENT, [printPdfMode]);
  const dispatchPdf = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.DISPATCH, [printPdfMode]);
  const filteredColumns = useMemo(() => PRODUCTS_COLUMNS(dispatchPdf, budget), [budget, dispatchPdf]);
  const comments = useMemo(() => budget?.products?.filter(product => product.dispatchComment)
    .map(product => `${product.name} - ${product.dispatchComment}`), [budget?.products]);
  const subtotalAfterDiscount = useMemo(() => getSubtotal(subtotal, -budget.globalDiscount), [subtotal, budget]);
  const finalTotal = useMemo(() => getSubtotal(subtotalAfterDiscount, budget.additionalCharge), [subtotalAfterDiscount, budget]);

  return (
    <table>
      <thead>
        <tr>
          <td>
            <HeaderContainer>
              <Flex flexDirection="column" alignSelf="center!important">
                <Title as="h3">N° {budget?.id}</Title>
                {isBudgetCancelled(budget?.state) && <Title as="h3">(Anulado)</Title>}
                <Title as="h6">{client?.name || "Razon Social"}</Title>
                <Title as="h6">CUIT: {client?.cuil || "CUIT"}</Title>
              </Flex>
              <Flex flexDirection="column" alignSelf="center!important">
                {dispatchPdf ? <Title as="h2">Remito</Title> :
                  <>
                    <Title as="h3">X</Title>
                    <Title as="h6">DOCUMENTO NO VALIDO COMO FACTURA</Title>
                  </>
                }
              </Flex>
              <Image src={`/clients/${id}.png`} alt="Logo empresa" />
            </HeaderContainer>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div style={{ width: '90vw' }}>
              <Divider />
              <ClientDataContainer>
                <DataContainer flex="1">
                  <HeaderLabel>Vendedor/a: {budget?.seller}</HeaderLabel>
                </DataContainer>
                <DataContainer flex="1">
                  <HeaderLabel>Fecha: {dayjs(budget?.createdAt).format('DD-MM-YYYY')}</HeaderLabel>
                </DataContainer>
                <DataContainer flex="1">
                  <HeaderLabel>Válido hasta: {dayjs(budget?.createdAt).add(10, 'day').format('DD-MM-YYYY')}</HeaderLabel>
                </DataContainer>
              </ClientDataContainer>
              {clientPdf &&
                <>
                  <ClientDataContainer>
                    <DataContainer flex="1">
                      <HeaderLabel>Dirección: {client?.addresses?.[0].address || "-"}</HeaderLabel>
                    </DataContainer>
                    <DataContainer flex="1">
                      <HeaderLabel>Teléfonos: {client?.phoneNumbers?.map(formatedSimplePhone).join(' | ') || "-"}</HeaderLabel>
                    </DataContainer>
                    <DataContainer flex="1">
                      <HeaderLabel>IVA: {client?.iva || "Condición IVA"}</HeaderLabel>
                    </DataContainer>
                  </ClientDataContainer>
                </>
              }
              <Divider />
              <ClientDataContainer>
                <DataContainer flex="1">
                  <HeaderLabel>Cliente: {(get(budget, "customer.name", ""))}</HeaderLabel>
                </DataContainer>
                <DataContainer flex="1">
                  <HeaderLabel>Dirección: {(get(budget, "customer.addresses[0].address", ""))}</HeaderLabel>
                </DataContainer>
                <DataContainer flex="1">
                  <HeaderLabel>Teléfono: {formatedSimplePhone(get(budget, "customer.phoneNumbers[0]"))}</HeaderLabel>
                </DataContainer>
              </ClientDataContainer>
              <Divider />
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
                            <Cell key={`cell_${header.id}`} align={header.align} width={header.width} $wrap={header.wrap}>
                              {header?.value(product)}
                            </Cell>
                          ))}
                        </Table.Row>
                      );
                    })}
                    {!dispatchPdf && (
                      <>
                        {!!budget?.globalDiscount && (
                          <>
                            <Table.Row>
                              <Cell $right textAlign="right" colSpan={filteredColumns.length - 1}><strong>SUB TOTAL</strong></Cell>
                              <Cell colSpan="1">
                                <strong>
                                  <Price value={subtotal} />
                                </strong>
                              </Cell>
                            </Table.Row>
                            <Table.Row>
                              <Cell $right textAlign="right" colSpan={filteredColumns.length - 1}><strong>DESCUENTO GLOBAL</strong></Cell>
                              <Cell colSpan="1"><strong>
                                {formatedPercentage(budget?.globalDiscount)}
                              </strong></Cell>
                            </Table.Row>
                          </>
                        )}
                        {!!budget?.additionalCharge && (
                          <>
                            <Table.Row>
                              <Cell $right textAlign="right" colSpan={filteredColumns.length - 1}><strong>SUB TOTAL</strong></Cell>
                              <Cell colSpan="1">
                                <strong>
                                  <Price value={subtotalAfterDiscount} />
                                </strong>
                              </Cell>
                            </Table.Row>
                            <Table.Row>
                              <Cell $right textAlign="right" colSpan={filteredColumns.length - 1}><strong>RECARGO</strong></Cell>
                              <Cell colSpan="1"><strong>
                                {formatedPercentage(budget?.additionalCharge)}
                              </strong></Cell>
                            </Table.Row>
                          </>
                        )}
                        <Table.Row>
                          <Cell $right textAlign="right" colSpan={filteredColumns.length - 1}><strong>TOTAL</strong></Cell>
                          <Cell colSpan="1">
                            <strong>
                              <Price value={finalTotal} />
                            </strong>
                          </Cell>
                        </Table.Row>
                      </>
                    )}
                  </Table.Body>
                </Table>
              </Flex>
              {(!!comments?.length || budget?.comments) && (
                <DataContainer width="100%">
                  <Label>Comentarios</Label>
                  <Segment
                    marginTop="0"
                    padding="5px">
                    {budget?.comments}
                    {!!comments.length && !dispatchPdf && (
                      <Box marginTop="2px">
                        <strong>Envío:</strong>
                        <List style={{ margin: '0' }}>
                          {comments.map((comment, index) => (
                            <List.Item key={index}>{comment}</List.Item>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Segment>
                </DataContainer>
              )}
              {!dispatchPdf &&
                <>
                  <Divider $borderless />
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
};
export default PDFfile;