import { Box, Flex, Icon, Label, OverflowWrapper } from '@/common/components/custom';
import { PriceLabel } from '@/common/components/form';
import { CommentTooltip } from "@/common/components/tooltips";
import { ALL, COLORS, DATE_FORMATS, ICONS, IN, OUT, SELECT_ALL_OPTION, SIZES } from '@/common/constants';
import { getFormatedDate } from '@/common/utils/dates';
import { Popup } from 'semantic-ui-react';

export const GET_CASH_BALANCE_QUERY_KEY = 'getCashBalance';
export const LIST_CASH_BALANCES_QUERY_KEY = 'listCashBalances';
export const CASH_BALANCES_FILTERS_KEY = 'cashBalancesFilters';
export const CASH_BALANCE_MOVEMENTS_FILTERS_KEY = "cashBalanceMovementsFilters";
export const CLOSED = "closed"
export const LIST_ATTRIBUTES = ["id", "startDate", "closeDate", "paymentMethods", "comments", "initialAmount", "currentAmount", "billsDetails", "billsDetailsOnClose", "state", "createdBy"];

export const CASH_BALANCE_STATES = {
  OPEN: {
    id: 'OPEN',
    title: 'Abiertas',
    singularTitle: 'Abierta',
    color: 'green',
    icon: 'check',
  },
  CLOSED: {
    id: 'CLOSED',
    title: 'Cerradas',
    singularTitle: 'Cerrada',
    color: 'grey',
    icon: 'hourglass half',
  },
};

export const getCashBalanceColumns = (state = CASH_BALANCE_STATES.OPEN.id) => {
  const columns = [
    {
      id: 1,
      title: "Id",
      key: "id",
      sortable: true,
      width: 1,
      value: (cashBalance) => (
        <Box width="60px">
          <Popup
            trigger={<Box width="60px">{cashBalance.id}</Box>}
            content={
              <>
                <Box>{`Abierta por ${cashBalance?.createdBy || "Sin vendedor"}`}</Box>
                <Box>{`Fecha: ${getFormatedDate(cashBalance?.createdAt, DATE_FORMATS.DATE_WITH_TIME)}`}</Box>
              </>
            }
            position="right center"
            size="mini"
          />
        </Box>
      ),
      sortValue: (cashBalance) => cashBalance.id ?? ""
    },
    {
      id: 2,
      title: "Fecha inicio",
      key: "startDate",
      sortable: true,
      align: "left",
      width: 2,
      value: (cashBalance) => (
        <Flex $justifyContent="space-between">
          {getFormatedDate(cashBalance.startDate, DATE_FORMATS.DATE_WITH_TIME)}
          <Flex $columnGap="7px" $alignItems="center" $justifyContent="flex-end">
            {cashBalance.comments && <CommentTooltip comment={cashBalance.comments} />}
          </Flex>
        </Flex>
      ),
      sortValue: (cashBalance) => cashBalance.startDate ?? ""
    },
    {
      id: 3,
      title: "Monto Inicial",
      key: "initialAmount",
      sortable: true,
      align: "left",
      width: 2,
      value: (cashBalance) => <PriceLabel value={cashBalance.initialAmount} />,
      sortValue: (cashBalance) => cashBalance.initialAmount ?? ""
    },
    {
      id: 4,
      title: "Monto Actual",
      key: "currentAmount",
      sortable: true,
      align: "left",
      width: 2,
      value: (cashBalance) => <PriceLabel value={cashBalance.currentAmount ?? ""} />,
      sortValue: (cashBalance) => cashBalance.currentAmount ?? ""
    },
    {
      id: 5,
      title: "Métodos de pago",
      align: "left",
      value: (cashBalance) => (
        <Flex $wrap $columnGap="5px" $rowGap="5px">
          {(cashBalance.paymentMethods?.length > 0)
            ? cashBalance.paymentMethods.map((method, index) => (
              <Label width="fit-content" key={index} size={SIZES.TINY}>
                {method}
              </Label>
            ))
            :
            <Label width="fit-content" size={SIZES.TINY}>
              Todos los métodos
            </Label>
          }
        </Flex>
      ),
    },
  ];

  if (state === CASH_BALANCE_STATES.CLOSED.id) {
    columns.splice(2, 0, {
      id: 6,
      width: 2,
      title: "Fecha cierre",
      key: "closeDate",
      sortable: true,
      align: "left",
      value: (cashBalance) => (
        <Flex $justifyContent="space-between">
          {getFormatedDate(cashBalance.closeDate, DATE_FORMATS.DATE_WITH_TIME)}
        </Flex>
      ),
      sortValue: (cashBalance) => cashBalance.closeDate ?? ""
    });
  }

  return columns;
};

export const EMPTY_CASH_BALANCE = { method: '', startDate: '', closeDate: '', id: '', comments: '' };
export const EMPTY_FILTERS = { id: '', state: CASH_BALANCE_STATES.OPEN.id, paymentMethods: SELECT_ALL_OPTION.value };

export const CASH_BALANCE_STATES_OPTIONS = Object.values(CASH_BALANCE_STATES)
  .map(({ id, title, color }) => ({
    key: id,
    text: (
      <Flex $alignItems="center" $justifyContent="space-between">
        {title}&nbsp;<Label width="fit-content" color={color} circular empty />
      </Flex>
    ),
    value: id
  }));

export const CASH_BALANCE_PAYMENT_METHODS_OPTIONS = Object.values(CASH_BALANCE_STATES)
  .map(({ id, title, color }) => ({
    key: id,
    text: (
      <Flex $alignItems="center" $justifyContent="space-between">
        {title}&nbsp;<Label width="fit-content" color={color} circular empty />
      </Flex>
    ),
    value: id
  }));

export const BILLS_DETAILS_TABLE_HEADERS = [
  {
    id: 1,
    title: "Denominación",
    width: 4,
    key: "denomination",
    sortable: true,
    value: (billDetail) => <PriceLabel value={billDetail.denomination} />,
    sortValue: (billDetail) => billDetail.denomination ?? ""
  }, {
    id: 2,
    width: 5,
    title: 'Cantidad',
    key: "quantity",
    align: "right",
    value: (billDetail) => billDetail.quantity,
    sortValue: (billDetail) => billDetail.quantity ?? ""
  },
  {
    id: 3,
    title: "Subtotal",
    width: 8,
    key: "subtotal",
    align: "right",
    value: (billDetail) => {
      const total = Number(billDetail.denomination) * Number(billDetail.quantity);
      return <PriceLabel value={total} />;
    },
    sortValue: (billDetail) => {
      const subtotal = Number(billDetail.denomination) * Number(billDetail.quantity);
      return subtotal || 0;
    }
  }
];

export const ARS_BILL_DENOMINATIONS = [
  { key: 10, value: 10, text: "$10" },
  { key: 20, value: 20, text: "$20" },
  { key: 50, value: 50, text: "$50" },
  { key: 100, value: 100, text: "$100" },
  { key: 200, value: 200, text: "$200" },
  { key: 500, value: 500, text: "$500" },
  { key: 1000, value: 1000, text: "$1.000" },
  { key: 2000, value: 2000, text: "$2.000" },
  { key: 10000, value: 10000, text: "$10.000" },
  { key: 20000, value: 20000, text: "$20.000" },
];

export const EMPTY_BILL = { denomination: '', quantity: '' };

export const CASH_FILTERS_KEY = "cashBalanceMovementsFilters";

export const EMPTY_CASH_BALANCE_MOVEMENTS_FILTERS = {
  type: "all",
  movementId: "",
};

export const CASH_BALANCE_MOVEMENTS_TABLE_HEADERS = [
  {
    id: 1,
    title: 'Fecha',
    key: 'date',
    width: 3,
    sortable: true,
    sortValue: (element) => element.date ?? "",
    value: (element) => (
      <Flex whiteSpace="nowrap" $alignItems="center">
        <Label ribbon width="fit-content" color={element.quantity < 0 ? COLORS.RED : COLORS.GREEN}>
          <Icon inverted name={element.quantity < 0 ? ICONS.ARROW_UP : ICONS.ARROW_DOWN} />
        </Label>
        <Box width="100%">
          {element.date ? getFormatedDate(element.date, DATE_FORMATS.DATE_WITH_TIME) : "-"}
        </Box>
      </Flex>
    )
  },
  {
    id: 2,
    title: 'Monto',
    key: 'quantity',
    sortable: true,
    sortValue: (element) => element.amount ?? "",
    width: 2,
    value: (element) => <PriceLabel value={element.amount} />
  },
  {
    id: 3,
    title: 'Método de Pago',
    key: 'method',
    sortable: true,
    sortValue: (element) => element.method ?? "",
    width: 3,
    value: (element) => element.method || "-"
  },
  {
    id: 4,
    title: 'Id',
    key: 'id',
    sortable: true,
    sortValue: (element) => element.movementId ?? "",
    width: 2,
    value: (element) => {
      const prefix = element.source === "expense" ? "Gasto" : "Venta";
      return `${prefix} - ${element.entityId}`;
    }
  },
  {
    id: 5,
    title: 'Comentarios',
    width: 6,
    align: "left",
    value: (element) => (
      <OverflowWrapper maxWidth="30vw" popupContent={element.comments}>
        {element.comments}
      </OverflowWrapper>
    )
  }
];

export const CASH_BALANCE_MOVEMENTS_TYPE_OPTIONS = [
  {
    key: ALL,
    text: (
      <Flex $alignItems="center" $justifyContent="space-between">
        Todos&nbsp;
      </Flex>
    ),
    value: ALL,
  },
  {
    key: IN,
    text: (
      <Flex $alignItems="center" $justifyContent="space-between">
        Ingresos&nbsp;
        <Icon name={ICONS.ARROW_DOWN} color={COLORS.GREEN} />
      </Flex>
    ),
    value: IN,
  },
  {
    key: OUT,
    text: (
      <Flex $alignItems="center" $justifyContent="space-between">
        Egresos&nbsp;
        <Icon name={ICONS.ARROW_UP} color={COLORS.RED} />
      </Flex>
    ),
    value: OUT,
  },
];

