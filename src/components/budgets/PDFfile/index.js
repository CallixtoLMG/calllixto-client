import { PRODUCTS_COLUMNS } from "@/components/budgets/budgets.common";
import { Price } from "@/components/common/custom";
import { Table, Total } from '@/components/common/table';
import { BUDGET_PDF_FORMAT, BUDGET_STATES } from "@/constants";
import { expirationDate, formatedDateOnly, formatedSimplePhone, getSubtotal, getTotalSum, isBudgetCancelled, isBudgetDraft } from "@/utils";
import dayjs from "dayjs";
import { get } from "lodash";
import { forwardRef, useMemo } from "react";
import { Box, Flex } from "rebass";
import { List } from "semantic-ui-react";
import {
  DataContainer,
  Divider,
  Image,
  SectionContainer,
  Title
} from "./styles";

const Field = ({ label, value, ...rest }) => (
  <Flex style={{ height: "15px", gridColumnGap: '5px' }} {...rest}>
    <Title as="h4" width="100px" textAlign="right" slim>{label} |</Title>
    <Title as="h4">{value?.toUpperCase() || '-'}</Title>
  </Flex>
);

const PDFfile = forwardRef(({ budget, client, printPdfMode, id, dolarExchangeRate = 0 }, ref) => {
  const clientPdf = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.CLIENT, [printPdfMode]);
  const dispatchPdf = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.DISPATCH, [printPdfMode]);
  const internal = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.INTERNAL, [printPdfMode]);
  const filteredColumns = useMemo(() => PRODUCTS_COLUMNS(dispatchPdf, budget), [budget, dispatchPdf]);
  const comments = useMemo(() => budget?.products?.filter(product => product.dispatchComment || product?.dispatch?.comment)
    .map(product => `${product.name} - ${product.dispatchComment || product?.dispatch?.comment}`), [budget?.products]);
  const subtotal = useMemo(() => getTotalSum(budget?.products), [budget]);
  const subtotalAfterDiscount = useMemo(() => getSubtotal(subtotal, -budget?.globalDiscount || 0), [subtotal, budget]);
  const finalTotal = useMemo(() => getSubtotal(subtotalAfterDiscount, budget?.additionalCharge || 0), [subtotalAfterDiscount, budget]);

  return (
    <Flex ref={ref} padding="30px" flexDirection="column" style={{ gridRowGap: '15px' }}>
      <Box>
        <Flex alignItems="center" marginBottom="15px" justifyContent="space-between">
          <Flex flexDirection="column" width="150px">
            <Title as="h3" cancelled={isBudgetCancelled(budget?.state)}>N° {budget?.id}</Title>
            {clientPdf && (
              <>
                <Title as="h4">{client?.name?.toUpperCase() || "Maderera Las Tapias"}</Title>
                <Title as="h4">CUIT: {client?.cuil?.toUpperCase() || "CUIT"}</Title>
                <Title as="h4">{client?.iva || "Condición IVA"}</Title>
              </>
            )}
          </Flex>
          <Flex flexDirection="column" flex="1">
            {isBudgetCancelled(budget?.state) && <Title as="h2">{BUDGET_STATES.CANCELLED.title.toUpperCase()}</Title>}
            {isBudgetDraft(budget?.state) && <Title as="h2">{BUDGET_STATES.DRAFT.title.toUpperCase()}</Title>}
            {dispatchPdf && <Title as="h2">REMITO</Title>}
            {clientPdf && (
              <Flex flexDirection="column" style={{ gridRowGap: '10px' }}>
                <Title as="h2">X</Title>
                <Title as="h5">DOCUMENTO NO VÁLIDO COMO FACTURA</Title>
              </Flex>
            )}
            {internal && <Title as="h2">INTERNO</Title>}
          </Flex>
          <Box width="150px">
            {clientPdf && <Image src={`/clients/${id}.png`} alt="Logo empresa"/>}
          </Box>
        </Flex>
        <Divider />
        <SectionContainer minHeight="50px">
          <Flex flexDirection="column" style={{ gridRowGap: '10px' }} flex="2">
            <Field label="Vendedor/a" value={budget?.seller} />
            <Field label="Teléfonos" value={client?.phoneNumbers?.map(formatedSimplePhone).join(' | ')} />
          </Flex>
          <Flex flexDirection="column" style={{ gridRowGap: '10px' }}>
            <Field label="Fecha" value={dayjs().format('DD-MM-YYYY')} />
            <Field label="Válido hasta" value={formatedDateOnly(expirationDate(budget?.createdAt, budget?.expirationOffsetDays))} />
          </Flex>
        </SectionContainer>
        <Divider />
        <SectionContainer minHeight="50px">
          <Flex flexDirection="column" style={{ gridRowGap: '10px' }} flex="2">
            <Field label="Cliente" value={(get(budget, "customer.name", ""))} />
            <Field label="Dirección" value={(get(budget, "customer.addresses[0].address", ""))} />
          </Flex>
          <Flex flexDirection="column" style={{ gridRowGap: '10px' }}>
            <Box />
            <Field label="Teléfono" value={formatedSimplePhone(get(budget, "customer.phoneNumbers[0]"))} />
          </Flex>
        </SectionContainer>
        <Divider />
      </Box>
      <Table
        mainKey="key"
        headers={filteredColumns}
        elements={budget?.products}
        basic
      />
      {!dispatchPdf && (
        <Total
          subtotal={subtotal}
          globalDiscount={budget?.globalDiscount}
          additionalCharge={budget?.additionalCharge}
          readOnly
          showAllways={false}
        />
      )}
      <Box height="10px" />
      <Flex flexDirection="column" style={{ gridRowGap: '25px' }}>
        {!!dolarExchangeRate && !dispatchPdf && (
          <DataContainer width="100%">
            <Title as="h4" alignSelf="left" slim>Cotización en USD</Title>
            <Divider />
            <Title as="h4" alignSelf="left" width="fit-content" minHeight="30px">
              <Price value={finalTotal / parseInt(dolarExchangeRate)} />
            </Title>
          </DataContainer>
        )}
        {(!!comments?.length || budget?.comments) && (
          <DataContainer width="100%">
            <Title as="h4" alignSelf="left" slim>Comentarios</Title>
            <Divider />
            <Title as="h4" alignSelf="left" minHeight="30px">
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
            </Title>
          </DataContainer>
        )}
        {!dispatchPdf &&
          <DataContainer width="100%">
            <Title as="h4" alignSelf="left" slim>Formas de Pago</Title>
            <Divider />
            <Title as="h4" alignSelf="left" minHeight="30px">
              {budget?.paymentMethods?.join(" | ")}
            </Title>
          </DataContainer>
        }
      </Flex>
    </Flex>
  )
});
PDFfile.displayName = 'PDFfile';

export default PDFfile;