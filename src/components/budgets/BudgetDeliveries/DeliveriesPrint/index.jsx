import { Box, Flex, FlexColumn } from "@/common/components/custom";
import { Table } from "@/common/components/table";
import { DATE_FORMATS } from "@/common/constants";
import { getFormatedDate } from "@/common/utils/dates";
import { DataContainer, Divider, SectionContainer, Title } from "@/components/budgets/PDFfile/styles";
import { getDeliveryPrintColumns } from "@/components/budgets/budgets.utils";
import { forwardRef, useMemo } from "react";

const PrintField = ({ label, value, width = "115px", $justifyContent }) => (
  <Flex $columnGap="5px" $minWidth="300px" $justifyContent={$justifyContent}>
    <Title as="h4" width={width} $textAlign="left" $slim>{label}</Title>
    <Title as="h4">| {value?.toString().toUpperCase() || "-"}</Title>
  </Flex>
);

const DeliveriesPrint = forwardRef(({ budget, history = [] }, ref) => {
  const printedAt = getFormatedDate(new Date(), DATE_FORMATS.ONLY_DATE);
  const headers = useMemo(() => getDeliveryPrintColumns(), []);
  const rows = useMemo(
    () =>
      history.flatMap((entry) =>
        entry.rows.map((row, index) => ({
          id: `${entry.id}-${row.productId}-${index}`,
          type: entry.inflow ? "Descuento" : "Entrega",
          date: getFormatedDate(entry.date, DATE_FORMATS.DATE_WITH_TIME_SECONDS),
          deliveryNote: entry.deliveryNote || "-",
          productId: row.productId,
          productName: row.productName,
          quantity: row.quantity,
          comments: row.comments || "-",
          dispatchComment: row.dispatchComment || "-",
        }))
      ),
    [history]
  );

  return (
    <FlexColumn ref={ref} $rowGap="15px">
      <Box>
        <Flex $alignItems="center" $marginBottom="15px" $justifyContent="space-between">
          <FlexColumn>
            <Title as="h3" $textAlign="left" $alignSelf="left">
              {budget?.id ? `N° ${budget.id}` : "Presupuesto"}
            </Title>
          </FlexColumn>
          <FlexColumn $rowGap="10px">
            <Title as="h2">ENTREGAS</Title>
            <Title as="h5">DOCUMENTO NO VALIDO COMO FACTURA</Title>
          </FlexColumn>
          <FlexColumn>
            <Title as="h3" $textAlign="right">Entregas del presupuesto</Title>
          </FlexColumn>
        </Flex>
        <Divider />
        <SectionContainer $alignItems="left" $flexDirection="column" $minHeight="50px">
          <Flex $justifyContent="space-between">
            <PrintField label="Presupuesto" value={budget?.id} />
            <PrintField $justifyContent="flex-end" label="Fecha impresion" value={printedAt} />
          </Flex>
          <Flex $justifyContent="space-between">
            <PrintField label="Vendedor/a" value={budget?.createdBy} />
            <PrintField $justifyContent="flex-end" label="Cliente" value={budget?.customer?.name} />
          </Flex>
        </SectionContainer>
        <Divider />
      </Box>
      <DataContainer width="100%">
        <Title as="h4" $alignSelf="left" $textAlignLast="left" $slim>Detalle de entregas</Title>
        <Divider />
        <Table
          mainKey="id"
          headers={headers}
          elements={rows}
          basic
          $wrap
        />
      </DataContainer>
    </FlexColumn>
  );
});

DeliveriesPrint.displayName = "DeliveriesPrint";

export default DeliveriesPrint;
