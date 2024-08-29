import { PRODUCTS_COLUMNS } from "@/components/budgets/budgets.common";
import { Box, Flex, FlexColumn, Price } from "@/components/common/custom";
import { Table, Total, TotalList } from '@/components/common/table';
import { BUDGET_PDF_FORMAT, BUDGET_STATES, PICK_UP_IN_STORE } from "@/constants";
import { expirationDate, formatedDateOnly, formatedSimplePhone, isBudgetCancelled, isBudgetDraft } from "@/utils";
import dayjs from "dayjs";
import { get } from "lodash";
import { forwardRef, useMemo } from "react";
import { List } from "semantic-ui-react";
import {
  DataContainer,
  Divider,
  Image,
  SectionContainer,
  Title
} from "./styles";

const Field = ({ label, value, ...rest }) => (
  <Flex columnGap="5px" minWidth="300px" {...rest}>
    <Title as="h4" width="100px" textAlign="right" $slim>{label} |</Title>
    <Title as="h4">{value?.toUpperCase() || '-'}</Title>
  </Flex>
);

const PDFfile = forwardRef(({ budget, client, printPdfMode, id, dolarExchangeRate = 0, subtotal, subtotalAfterDiscount, total, selectedContact }, ref) => {
  const clientPdf = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.CLIENT, [printPdfMode]);
  const dispatchPdf = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.DISPATCH, [printPdfMode]);
  const internal = useMemo(() => printPdfMode === BUDGET_PDF_FORMAT.INTERNAL, [printPdfMode]);
  const filteredColumns = useMemo(() => PRODUCTS_COLUMNS(dispatchPdf, budget), [budget, dispatchPdf]);
  const comments = useMemo(() => budget?.products?.filter(product => product.dispatchComment || product?.dispatch?.comment)
    .map(product => `${product.name} - ${product.dispatchComment || product?.dispatch?.comment}`), [budget?.products]);
  const roundedFinalTotal = parseFloat(total.toFixed(2));

  const createTotalListItems = (paymentMethods = [], total) => {
    const totalAssigned = paymentMethods.reduce((acc, payment) => acc + payment.amount, 0) || 0;
    const totalPending = total - totalAssigned;

    const items = paymentMethods.map((payment, index) => ({
      id: index + 1,
      title: payment.method,
      amount: <Price value={payment.amount?.toLocaleString()} />,
      ...(payment.comments && { subtitle: payment.comments }),
    }));

    items.push({
      id: items.length + 1,
      title: "Total Pagado",
      amount: <Price value={totalAssigned.toLocaleString()} />,
    });

    if (totalPending > 0) {
      items.push({
        id: items.length + 2,
        title: "Total Pendiente",
        amount: <Price value={totalPending.toLocaleString()} />,
      });
    }

    items.push({
      id: items.length + (totalPending > 0 ? 3 : 2),
      title: "Total a Pagar",
      amount: <Price value={roundedFinalTotal.toLocaleString()} />,
    });

    return items;
  };

  const TOTAL_LIST_ITEMS = createTotalListItems(budget?.paymentsMade, roundedFinalTotal);

  return (
    <FlexColumn ref={ref} padding="30px" rowGap="15px">
      <Box>
        <Flex alignItems="center" marginBottom="15px" justifyContent="space-between">
          <FlexColumn width="150px">
            <Title as="h3" $cancelled={isBudgetCancelled(budget?.state)}>N° {budget?.id}</Title>
            {clientPdf && (
              <>
                <Title as="h4">{client?.name?.toUpperCase() || "Maderera Las Tapias"}</Title>
                <Title as="h4">CUIT: {client?.cuil?.toUpperCase() || "CUIT"}</Title>
                <Title as="h4">{client?.iva || "Condición IVA"}</Title>
              </>
            )}
          </FlexColumn>
          <FlexColumn flex="1">
            {isBudgetCancelled(budget?.state) && <Title as="h2">{BUDGET_STATES.CANCELLED.title.toUpperCase()}</Title>}
            {isBudgetDraft(budget?.state) && <Title as="h2">{BUDGET_STATES.DRAFT.title.toUpperCase()}</Title>}
            {dispatchPdf && <Title as="h2">REMITO</Title>}
            {clientPdf && (
              <FlexColumn rowGap="10px">
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
        <SectionContainer alignItems="left" flexDirection="column" minHeight="50px">
          <Flex>
            <Field label="Vendedor/a" value={budget?.seller} flex="1" />
            <Field label="Fecha" value={dayjs().format('DD-MM-YYYY')} />
          </Flex>
          <Flex>
            <Field flex="1" label="Teléfonos" value={client?.phoneNumbers?.map(formatedSimplePhone).join(' | ')} />
            <Field label="Válido hasta" value={formatedDateOnly(expirationDate(budget?.expirationOffsetDays, budget?.createdAt))} />
          </Flex>
        </SectionContainer>
        <Divider />
        <SectionContainer alignItems="left" flexDirection="column" minHeight="50px">
          <Flex >
            <Field width="100%" label="Cliente" value={(get(budget, "customer.name", ""))} />
          </Flex>
          <Flex>
            <Field flex="1" width="fit-content" label="Dirección" value={budget?.pickUpInStore ? PICK_UP_IN_STORE : selectedContact?.address} />
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
      <FlexColumn rowGap="15px">
        {!!dolarExchangeRate && !dispatchPdf && (
          <DataContainer width="100%">
            <Title as="h4" alignSelf="left" $slim>Cotización en USD</Title>
            <Divider />
            <Title as="h4" alignSelf="left" width="fit-content" minHeight="30px">
              <Price value={roundedFinalTotal / parseInt(dolarExchangeRate)} />
            </Title>
          </DataContainer>
        )}
        {(budget?.comments?.trim() || (!dispatchPdf && comments?.length > 0)) && (
          <DataContainer width="100%">
            <Title as="h4" alignSelf="left" textAlignLast="left" $slim>Comentarios</Title>
            <Divider />
            <Title as="h4" alignSelf="left" textAlignLast="left" minHeight="30px">
              {budget?.comments}
              {comments?.length > 0 && !dispatchPdf && (
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
          <>
            <DataContainer width="100%">
              <Title as="h4" alignSelf="left" textAlignLast="left" $slim>Detalles de Pago</Title>
              <Divider />
              <TotalList labelWidth="200px" width="300px" readOnly items={TOTAL_LIST_ITEMS} />
            </DataContainer>
            <DataContainer width="100%">
              <Title as="h4" alignSelf="left" textAlignLast="left" $slim>Formas de Pago</Title>
              <Divider />
              <Title as="h4" alignSelf="left" textAlignLast="left" minHeight="30px">
                {budget?.paymentMethods?.join(" | ")}
              </Title>
            </DataContainer>
          </>
        }
      </FlexColumn>
    </FlexColumn >
  )
});
PDFfile.displayName = 'PDFfile';

export default PDFfile;