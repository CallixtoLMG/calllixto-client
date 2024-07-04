import { PRODUCTS_COLUMNS } from "@/components/budgets/budgets.common";
import { Price } from "@/components/common/custom";
import { Table, Total } from '@/components/common/table';
import { BUDGET_PDF_FORMAT } from "@/constants";
import { formatedSimplePhone, getSubtotal, getTotalSum, isBudgetCancelled } from "@/utils";
import dayjs from "dayjs";
import { get } from "lodash";
import { forwardRef, useMemo } from "react";
import { Box, Flex } from "rebass";
import { List } from "semantic-ui-react";
import {
  DataContainer,
  Divider,
  HeaderLabel,
  Image,
  Label,
  SectionContainer,
  Segment,
  Title
} from "./styles";

const PDFfile = forwardRef(({ budget, client, printPdfMode, id, dolarExchangeRate = 0 }, ref) => {
  const clientPdf = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.CLIENT, [printPdfMode]);
  const dispatchPdf = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.DISPATCH, [printPdfMode]);
  const filteredColumns = useMemo(() => PRODUCTS_COLUMNS(dispatchPdf, budget), [budget, dispatchPdf]);
  const comments = useMemo(() => budget?.products?.filter(product => product.dispatchComment || product?.dispatch?.comment)
    .map(product => `${product.name} - ${product.dispatchComment || product?.dispatch?.comment}`), [budget?.products]);
  const subtotal = useMemo(() => getTotalSum(budget?.products), [budget]);
  const subtotalAfterDiscount = useMemo(() => getSubtotal(subtotal, -budget?.globalDiscount || 0), [subtotal, budget]);
  const finalTotal = useMemo(() => getSubtotal(subtotalAfterDiscount, budget?.additionalCharge || 0), [subtotalAfterDiscount, budget]);

  return (
    <Flex ref={ref} padding="40px" flexDirection="column" style={{ gridRowGap: '20px' }}>
      <Box>
        <Flex alignItems="center" justifyContent="space-between" marginBottom="10px">
          <Flex flexDirection="column">
            <Title as="h2" cancelled={isBudgetCancelled(budget?.state)}>N° {budget?.id}</Title>
            <Title as="h4">{client?.name || "Razon Social"}</Title>
            <Title as="h4">CUIT: {client?.cuil || "CUIT"}</Title>
          </Flex>
          <Flex flexDirection="column">
            {dispatchPdf ? <Title as="h2">Remito</Title> :
              <>
                <Title as="h2">X</Title>
                <Title as="h5">DOCUMENTO NO VALIDO COMO FACTURA</Title>
              </>
            }
          </Flex>
          <Image src={`/clients/${id}.png`} alt="Logo empresa" />
        </Flex>
        <Divider />
        <SectionContainer>
          <HeaderLabel>Vendedor/a: {budget?.seller}</HeaderLabel>
          <HeaderLabel>Fecha: {dayjs(budget?.createdAt).format('DD-MM-YYYY')}</HeaderLabel>
          <HeaderLabel>Válido hasta: {dayjs(budget?.createdAt).add(10, 'day').format('DD-MM-YYYY')}</HeaderLabel>
        </SectionContainer>
        {true &&
          <SectionContainer>
            <HeaderLabel>Dirección: {client?.addresses?.[0].address || "-"}</HeaderLabel>
            <HeaderLabel>Teléfonos: {client?.phoneNumbers?.map(formatedSimplePhone).join(' | ') || "-"}</HeaderLabel>
            <HeaderLabel>IVA: {client?.iva || "Condición IVA"}</HeaderLabel>
          </SectionContainer>
        }
        <Divider />
        <SectionContainer>
          <HeaderLabel>Cliente: {(get(budget, "customer.name", ""))}</HeaderLabel>
          <HeaderLabel>Dirección: {(get(budget, "customer.addresses[0].address", ""))}</HeaderLabel>
          <HeaderLabel>Teléfono: {formatedSimplePhone(get(budget, "customer.phoneNumbers[0]"))}</HeaderLabel>
        </SectionContainer>
        <Divider />
      </Box>
      <Table
        mainKey="key"
        headers={filteredColumns}
        elements={budget?.products}
      />
      {!dispatchPdf && (
        <Total subtotal={subtotal} globalDiscount={budget?.globalDiscount} additionalCharge={budget?.additionalCharge} />
      )}
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
        <DataContainer width="100%">
          <Label >Formas de pago</Label>
          <Segment marginTop="0">
            {budget?.paymentMethods?.join(" | ")}
          </Segment>
        </DataContainer>
      }
      {!!dolarExchangeRate &&
        <DataContainer width="100%">
          <Label>Cotización en USD</Label>
          <Segment marginTop="0">
            <Price value={finalTotal / parseInt(dolarExchangeRate)} />
          </Segment>
        </DataContainer>
      }
    </Flex>
  )
});
PDFfile.displayName = 'PDFfile';

export default PDFfile;