import { Box, Flex, FlexColumn } from "@/common/components/custom";
import { PriceLabel } from "@/common/components/form";
import { Table, Total, TotalList } from '@/common/components/table';
import { getFormatedPhone, getFormatedPrice } from "@/common/utils";
import { getDateWithOffset, getFormatedDate, getSortedPaymentsByDate } from "@/common/utils/dates";
import { BUDGET_PDF_FORMAT, BUDGET_STATES } from "@/components/budgets/budgets.constants";
import { getProductsColumns } from "@/components/budgets/budgets.utils";
import { get } from "lodash";
import { forwardRef, useMemo } from "react";
import { List } from "semantic-ui-react";
import { isBudgetCancelled, isBudgetDraft } from "../budgets.utils";
import {
  DataContainer,
  Divider,
  Image,
  SectionContainer,
  Title
} from "./styles";

const Field = ({ label, value, ...rest }) => (
  <Flex $columnGap="5px" $minWidth="300px" {...rest}>
    <Title as="h4" width="100px" $textAlign="right" $slim>{label} |</Title>
    <Title as="h4">{value?.toUpperCase() || '-'}</Title>
  </Flex>
);

const PDFfile = forwardRef(({ budget, client, printPdfMode, id, dolarExchangeRate = 0, subtotal, subtotalAfterDiscount, total, selectedContact, showPrices }, ref) => {
  const clientPdf = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.CLIENT.key, [printPdfMode]);
  const dispatchPdf = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.DISPATCH.key, [printPdfMode]);
  const internal = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.INTERNAL.key, [printPdfMode]);
  const filteredColumns = useMemo(() => getProductsColumns(dispatchPdf, budget, showPrices), [budget, dispatchPdf, showPrices]);
  const comments = useMemo(() => budget?.products?.filter(product => product.dispatchComment || product?.dispatch?.comment)
    .map(product => `${product.name} - ${product.dispatchComment || product?.dispatch?.comment}`), [budget?.products]);
  const roundedFinalTotal = parseFloat(total?.toFixed(2));

  const createTotalListItems = (paymentMethods = [], total) => {

    const sortedPayments = getSortedPaymentsByDate(paymentMethods);

    const totalAssigned = sortedPayments.reduce((acc, payment) => acc + payment.amount, 0) || 0;
    const totalPending = total - totalAssigned;
    const items = sortedPayments.map((payment, index) => {
      const date = payment.date ? getFormatedDate(payment.date) : null;
      const subtitleParts = [];

      if (date) subtitleParts.push(date);
      if (payment.comments) subtitleParts.push(payment.comments);

      return {
        id: index + 1,
        title: payment.method,
        amount: <PriceLabel value={payment.amount} />,
        ...(subtitleParts.length > 0 && { subtitle: subtitleParts.join(" | ") }),
      };
    });

    items.push({
      id: items.length + 1,
      title: "Total Pagado",
      amount: <PriceLabel value={totalAssigned} />,
    });

    if (totalPending > 0) {
      items.push({
        id: items.length + 2,
        title: "Total Pendiente",
        amount: <PriceLabel value={totalPending} />,
      });
    }

    items.push({
      id: items.length + (totalPending > 0 ? 3 : 2),
      title: "Total a Pagar",
      amount: <PriceLabel value={roundedFinalTotal} />,
    });

    return items;
  };

  const TOTAL_LIST_ITEMS = createTotalListItems(budget?.paymentsMade, roundedFinalTotal);
  return (
    <FlexColumn ref={ref} $rowGap="15px">
      <Box>
        <Flex $alignItems="center" $marginBottom="15px" $justifyContent="space-between">
          <FlexColumn width="150px">
            <Title as="h3" $cancelled={isBudgetCancelled(budget?.state)}>N° {budget?.id}</Title>
            {clientPdf && (
              <>
                <Title as="h4">{client?.name?.toUpperCase() || "Maderera Las Tapias"}</Title>
                <Title as="h4">CUIT: {client?.cuil?.toUpperCase() || "CUIT"}</Title>
                <Title as="h4">{client?.taxCondition || "Condición IVA"}</Title>
              </>
            )}
          </FlexColumn>
          <FlexColumn>
            {isBudgetCancelled(budget?.state) && <Title as="h2">{BUDGET_STATES.CANCELLED.title.toUpperCase()}</Title>}
            {isBudgetDraft(budget?.state) && <Title as="h2">{BUDGET_STATES.DRAFT.title.toUpperCase()}</Title>}
            {dispatchPdf && <Title as="h2">REMITO</Title>}
            {clientPdf && (
              <FlexColumn $rowGap="10px">
                <Title as="h2">X</Title>
                <Title as="h5">DOCUMENTO NO VÁLIDO COMO FACTURA</Title>
              </FlexColumn>
            )}
            {internal && <Title as="h2">INTERNO</Title>}
          </FlexColumn>
          <Box width="150px">
            {clientPdf && <Image src={`/clients/${id}.png`} alt="Logo empresa" />}
          </Box>
        </Flex>
        <Divider />
        <SectionContainer $alignItems="left" $flexDirection="column" $minHeight="50px">
          <Flex>
            <Field label="Vendedor/a" value={budget?.seller} />
            <Field label="Fecha" value={getFormatedDate()} />
          </Flex>
          <Flex>
            <Field label="Teléfonos" value={client?.phoneNumbers?.map(getFormatedPhone).join(' | ')} />
            <Field label="Válido hasta" value={getDateWithOffset(budget?.createdAt, budget?.expirationOffsetDays, 'days')} />
          </Flex>
        </SectionContainer>
        <Divider />
        <SectionContainer $alignItems="left" $flexDirection="column" $minHeight="50px">
          <Flex >
            <Field width="100%" label="Cliente" value={(get(budget, "customer.name", ""))} />
          </Flex>
          <Flex>
            <Field flex="1" width="fit-content" label="Dirección" value={selectedContact?.address} />
            <Field width="fit-content" label="Teléfono" value={selectedContact?.phone} />
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
      {
        !dispatchPdf && (
          <Total
            subtotal={subtotal}
            globalDiscount={budget?.globalDiscount}
            additionalCharge={budget?.additionalCharge}
            readOnly
            showAllways={false}
            total={roundedFinalTotal}
            subtotalAfterDiscount={subtotalAfterDiscount}
          />
        )
      }
      {client?.id === 'maderera-las-tapias' && (
        <Box width="100%">
          Controle su mercadería. No se aceptan reclamos, devoluciones o cambios una vez firmado el conforme. La mercadería se descarga el pie del camión, sin excepción.
        </Box>
      )}
      <FlexColumn $rowGap="15px">
        {!dispatchPdf &&
          <>
            <DataContainer width="100%">
              <Title as="h4" $alignSelf="left" $textAlignLast="left" $slim>Detalles de Pago</Title>
              <Divider />
              <TotalList readOnly items={TOTAL_LIST_ITEMS} />
            </DataContainer>
            {!!dolarExchangeRate && (
              <DataContainer width="100%">
                <Title as="h4" $alignSelf="left" $textAlignLast="left" $slim>Cotización en USD a Tasa de Cambio: <b>{getFormatedPrice(dolarExchangeRate)}</b></Title>
                <Divider />
                <Title as="h4" $alignSelf="left" width="fit-content" $minHeight="30px">
                  <PriceLabel value={roundedFinalTotal / parseInt(dolarExchangeRate)} />
                </Title>
              </DataContainer>
            )}
            <DataContainer width="100%">
              <Title as="h4" $alignSelf="left" $textAlignLast="left" $slim>Formas de Pago</Title>
              <Divider />
              <Title as="h4" $alignSelf="left" $textAlignLast="left" $minHeight="30px">
                {budget?.paymentMethods?.join(" | ")}
              </Title>
            </DataContainer>
          </>
        }
        {(budget?.comments?.trim() || (!dispatchPdf && comments?.length > 0)) && (
          <DataContainer width="100%">
            <Title as="h4" $alignSelf="left" $textAlignLast="left" $slim>Comentarios</Title>
            <Divider />
            <Title as="h4" $alignSelf="left" $textAlignLast="left" $minHeight="30px">
              {budget?.comments}
              {comments?.length > 0 && !dispatchPdf && (
                <Box $marginTop="2px">
                  <strong>Detalle producto:</strong>
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
      </FlexColumn>
    </FlexColumn >
  )
});
PDFfile.displayName = 'PDFfile';

export default PDFfile;