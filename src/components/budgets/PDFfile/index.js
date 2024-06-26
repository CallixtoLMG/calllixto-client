import { PRODUCTS_COLUMNS } from "@/components/budgets/budgets.common";
import { Price } from "@/components/common/custom";
import { Cell, HeaderCell } from '@/components/common/table';
import { BUDGET_PDF_FORMAT } from "@/constants";
import { formatedPercentage, formatedSimplePhone } from "@/utils";
import dayjs from "dayjs";
import { get } from "lodash";
import { useMemo } from "react";
import { Flex } from "rebass";
import { Table } from "semantic-ui-react";
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
              <Title color as="h2">MADERERA LAS TAPIAS</Title>
              <Flex flexDirection="column" alignSelf="center!important">
                <Title as="h5">X</Title>
                <Title as="h6">DOCUMENTO NO VALIDO COMO FACTURA</Title>
                {dispatchPdf && <Title as="h5">Remito</Title>}
              </Flex>
              <Image src="/Las Tapias.png" alt="Maderera logo" />
            </HeaderContainer>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div style={{ width: '80vw' }}>
              <Divider />
              <ClientDataContainer>
                <DataContainer flex="1">
                  <HeaderLabel>Vendedor/a: {budget?.seller}</HeaderLabel>
                  <HeaderLabel>Presupuesto N° {budget?.id}</HeaderLabel>
                </DataContainer>
                <DataContainer flex="1">
                  <HeaderLabel>Fecha :{dayjs(budget?.createdAt).format('DD-MM-YYYY')}</HeaderLabel>
                  <HeaderLabel>Válido hasta: {dayjs(budget?.createdAt).add(10, 'day').format('DD-MM-YYYY')}</HeaderLabel>
                </DataContainer>
              </ClientDataContainer>
              {clientPdf &&
                <>
                  <Divider />
                  <ClientDataContainer>
                    <DataContainer flex="1">
                      <HeaderLabel>Dirección: {client?.addresses?.[0].address || "Calle Bananita Dolca al 1900"}</HeaderLabel>
                      <HeaderLabel>Teléfonos: {client?.phoneNumbers?.map(formatedSimplePhone).join(' | ') || "51313151351 | 51313151351"}</HeaderLabel>
                    </DataContainer>
                    <DataContainer flex="1">
                      <HeaderLabel>CUIT: {client?.cuil || "51313151351"}</HeaderLabel>
                      <HeaderLabel>IVA: {client?.iva || "51313151351"}</HeaderLabel>
                    </DataContainer>
                  </ClientDataContainer>
                </>
              }
              <Divider />
              <ClientDataContainer>
                <DataContainer flex="1">
                  <HeaderLabel>Cliente: {(get(budget, "customer.name", ""))}</HeaderLabel>
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
                          <Cell colSpan="1">
                            <strong>
                              <Price value={total} />
                            </strong>
                          </Cell>
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