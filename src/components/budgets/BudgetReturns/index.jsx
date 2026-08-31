import { IconedButton } from "@/common/components/buttons";
import { Box, Flex, FlexColumn, Label, OverflowWrapper } from "@/common/components/custom";
import { PriceLabel } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { COLORS, CONTENT_SIZES, DATE_FORMATS, ICONS } from "@/common/constants";
import { getFormatedDate } from "@/common/utils/dates";
import { RULES } from "@/roles";
import { useMemo } from "react";
import { Header } from "@/components/products/ProductStock/styles";
import { MOCK_BUDGET_RETURNS, MOCK_RETURNS_SUMMARY_STATE } from "./mocks";
import { RETURN_REASONS, RETURN_RESOLUTIONS, RETURN_STATES, RETURN_SUMMARY_STATES } from "./returns.constants";

const getReturnsSummaryState = (returns) => {
  const confirmedReturns = returns.filter((returnItem) => returnItem.state === "CONFIRMED");

  if (!confirmedReturns.length) return RETURN_SUMMARY_STATES.NO_RETURNS;

  return RETURN_SUMMARY_STATES[MOCK_RETURNS_SUMMARY_STATE] ?? RETURN_SUMMARY_STATES.PARTIALLY_RETURNED;
};

const getReturnHeaders = () => [
  {
    id: "date",
    key: "date",
    title: "Fecha",
    width: 2,
    value: (returnItem) => getFormatedDate(returnItem.date, DATE_FORMATS.DATE_WITH_TIME),
    sortValue: (returnItem) => returnItem.date,
    sortable: true,
  },
  {
    id: "id",
    key: "id",
    title: "Id",
    width: 1,
    value: (returnItem) => returnItem.id,
    sortable: true,
  },
  {
    id: "reason",
    key: "reason",
    title: "Motivo",
    width: 3,
    align: "left",
    value: (returnItem) => RETURN_REASONS[returnItem.reason] ?? returnItem.reason,
    sortValue: (returnItem) => RETURN_REASONS[returnItem.reason] ?? returnItem.reason,
    sortable: true,
  },
  {
    id: "productCount",
    key: "productCount",
    title: "Productos",
    width: 1,
    value: (returnItem) => returnItem.productCount,
    sortable: true,
  },
  {
    id: "returnedAmount",
    key: "returnedAmount",
    title: "Total devuelto",
    width: 2,
    value: (returnItem) => <PriceLabel value={returnItem.returnedAmount} />,
    sortable: true,
  },
  {
    id: "resolution",
    key: "resolution",
    title: "Resolución",
    width: 2,
    value: (returnItem) => RETURN_RESOLUTIONS[returnItem.resolution] ?? returnItem.resolution,
    sortValue: (returnItem) => RETURN_RESOLUTIONS[returnItem.resolution] ?? returnItem.resolution,
    sortable: true,
  },
  {
    id: "state",
    key: "state",
    title: "Estado",
    width: 2,
    value: (returnItem) => {
      const state = RETURN_STATES[returnItem.state];

      return (
        <Label color={state?.color ?? COLORS.GREY} width={CONTENT_SIZES.FIT}>
          {state?.label ?? returnItem.state}
        </Label>
      );
    },
    sortValue: (returnItem) => RETURN_STATES[returnItem.state]?.label ?? returnItem.state,
    sortable: true,
  },
];

const getReturnSummaryHeaders = () => [
  {
    id: "state",
    title: "Estado",
    width: 3,
    align: "left",
    value: (summary) => (
      <OverflowWrapper maxWidth="220px" popupContent={summary.state}>
        {summary.state}
      </OverflowWrapper>
    ),
  },
  {
    id: "returns",
    title: "Devoluciones",
    width: 2,
    value: (summary) => summary.returnsCount,
  },
  {
    id: "returned-total",
    title: "Total devuelto",
    width: 2,
    value: (summary) => <PriceLabel value={summary.returnedTotal} />,
  },
];

const BudgetReturns = ({ role, onCreateReturn }) => {
  const canCreateReturn = Boolean(RULES.canCreate[role]);
  const returns = MOCK_BUDGET_RETURNS;
  const confirmedReturns = useMemo(
    () => returns.filter((returnItem) => returnItem.state === "CONFIRMED"),
    [returns]
  );
  const returnedTotal = useMemo(
    () => confirmedReturns.reduce((sum, returnItem) => sum + Number(returnItem.returnedAmount ?? 0), 0),
    [confirmedReturns]
  );
  const summaryState = getReturnsSummaryState(returns);
  const summaryRows = useMemo(() => [
    {
      id: "returns-summary",
      state: summaryState,
      returnsCount: confirmedReturns.length,
      returnedTotal,
    },
  ], [confirmedReturns.length, returnedTotal, summaryState]);

  return (
    <FlexColumn width="100%" $rowGap="15.1px" className="ui form">
      <Flex $justifyContent="space-between">
        <Header>
          Devoluciones
        </Header>
        {canCreateReturn && (
          <Flex $columnGap="15px">
            <Box width={CONTENT_SIZES.FIT}>
            <IconedButton
              icon={ICONS.ADD}
              color={COLORS.GREEN}
              text="Nueva devolución"
              width={CONTENT_SIZES.FIT}
              onClick={onCreateReturn}
              dataTestId="budget-create-return-button"
            />
            </Box>
          </Flex>
        )}
      </Flex>
      <Table
        mainKey="id"
        headers={getReturnSummaryHeaders()}
        elements={summaryRows}
      />
      <Table
        mainKey="id"
        headers={getReturnHeaders()}
        elements={returns}
      />
    </FlexColumn>
  );
};

export default BudgetReturns;
