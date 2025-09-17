import { Flex, Label, OverflowWrapper } from '@/common/components/custom';
import { PriceLabel } from '@/common/components/form';
import { CommentTooltip } from "@/common/components/tooltips";
import { DATE_FORMATS } from '@/common/constants';
import { getFormatedDate } from '@/common/utils/dates';

export const GET_CASH_BALANCE_QUERY_KEY = 'getCashBalance';
export const LIST_CASH_BALANCES_QUERY_KEY = 'listCashBalances';
export const CASH_BALANCES_FILTERS_KEY = 'cashBalancesFilters';

export const ATTRIBUTES = { ID: "id", START_DATE: "startDate", CLOSE_DATE: "closeDate", PAYMENT_METHODS: "paymentMethods", COMMENTS: "comments", INITIAL_AMOUNT: "initialAmount", ACTUAL_AMOUNT: "actualAmount", BILLS_DETAILS: "billsDetails", STATE: "state" };

export const CASH_BALANCE_STATES = {
  OPEN: {
    id: 'OPEN',
    title: 'Abiertas',
    singularTitle: 'Abierta',
    color: 'green',
    icon: 'check',
  },
  CLOSE: {
    id: 'CLOSE',
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
      value: (cashBalance) => cashBalance.id,
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
          {getFormatedDate(cashBalance.startDate, DATE_FORMATS.ONLY_DATE)}
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
      value: (cashBalance) => <PriceLabel value={cashBalance.initialAmount} />,
      sortValue: (cashBalance) => cashBalance.initialAmount ?? ""
    },
    {
      id: 4,
      title: "Monto Actual",
      key: "actualAmount",
      sortable: true,
      align: "left",
      value: (cashBalance) => <PriceLabel value={cashBalance.actualAmount ?? ""} />,
      sortValue: (cashBalance) => cashBalance.actualAmount ?? ""
    },
    {
      id: 5,
      title: "Métodos de pago",
      key: "method",
      sortable: true,
      align: "left",
      value: (cashBalance) =>
        <Flex $justifyContent="space-between">
          <OverflowWrapper maxWidth="15vw" popupContent={cashBalance.method}>
            {cashBalance.method}
          </OverflowWrapper>
        </Flex>,
      sortValue: (cashBalance) => cashBalance.method ?? ""
    },
    // {
    //   id: 6,
    //   title: "Detalle de Billetes",
    //   key: "billsDetails",
    //   sortable: true,
    //   align: "left",
    //   value: (cashBalance) =>
    //     <Flex $justifyContent="space-between">
    //       <OverflowWrapper
    //         maxWidth="30vw"
    //         popupContent={Object.entries(cashBalance.billsDetails || {})
    //           .map(([denomination, quantity]) => `${denomination} x ${quantity}`)
    //           .join(" / ")}>
    //         {Object.entries(cashBalance.billsDetails || {})
    //           .map(([denomination, quantity]) => `${denomination} x ${quantity}`)
    //           .join(" / ")
    //         }
    //       </OverflowWrapper>
    //     </Flex>,
    //   sortValue: (cashBalance) => Object.entries(cashBalance.billsDetails || {})
    //     .map(([denomination, quantity]) => `${denomination}x${quantity}`)
    //     .join(" ") ?? ""
    // },
  ];

  if (state === CASH_BALANCE_STATES.CLOSE.id) {
    columns.splice(2, 0, {
      id: 2.5,
      title: "Fecha cierre",
      key: "closeDate",
      sortable: true,
      align: "left",
      value: (cashBalance) => (
        <Flex $justifyContent="space-between">
          {cashBalance.closeDate}
        </Flex>
      ),
      sortValue: (cashBalance) => cashBalance.closeDate ?? ""
    });
  }

  return columns;
};

export const EMPTY_CASH_BALANCE = { method: '', startDate: '', closeDate: '', id: '', comments: '' };
export const EMPTY_FILTERS = { id: '', state: CASH_BALANCE_STATES.OPEN.id };

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
