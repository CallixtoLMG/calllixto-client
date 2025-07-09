import { Flex, OverflowWrapper } from "@/common/components/custom";
import { PriceLabel } from "@/common/components/form";
import { CommentTooltip, TagsTooltip } from "@/common/components/tooltips";
import { Label } from "semantic-ui-react";

export const LIST_EXPENSES_QUERY_KEY = 'listExpenses';
export const GET_EXPENSE_QUERY_KEY = 'getExpense';
export const EXPENSES_FILTERS_KEY = 'expensesFilters';

export const ATTRIBUTES = { ID: "id", NAME: "name", CATEGORIES: "categories", PAYMENT_DETAILS: "paymentDetails", TAGS: "tags", AMOUNT: "amount", EXPIRATION: "expiration", COMMENT: "comments", STATE: "state" };

export const HEADERS = [
  {
    id: 1,
    title: "Id",
    width: 2,
    value: (expense) => expense.id
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
    value: (expense) => {
      const { tags, name, comments } = expense;
      return (
        <Flex $justifyContent="space-between" $alignItems="center">
          <OverflowWrapper maxWidth="45vw" popupContent={name}>
            {name}
          </OverflowWrapper>
          <Flex $columnGap="7px" $alignItems="center" $justifyContent="flex-end">
            {tags && <TagsTooltip maxWidthOverflow="8vw" tooltip="true" tags={tags} />}
            {comments && <CommentTooltip tooltip="true" comment={comments} />}
          </Flex>
        </Flex>
      );
    }
  },
  {
    id: 3,
    title: "Categorias",
    align: "right",
    value: (expense) => {
      return (
        <Flex $columnGap="7px" $alignItems="center" $justifyContent="flex-end">
          {expense.categories && <TagsTooltip maxWidthOverflow="8vw" tooltip="true" tags={expense.categories} />}
        </Flex>
      );
    }
  },
  {
    id: 4,
    title: "Monto",
    align: "left",
    value: (expense) => <PriceLabel value={expense.amount} />,
  }
];

export const EXPENSE_STATES = {
  ACTIVE: {
    id: 'ACTIVE',
    title: 'Activos',
    singularTitle: 'Activo',
    color: 'green',
    icon: 'check',
  },
  INACTIVE: {
    id: 'INACTIVE',
    title: 'Inactivos',
    singularTitle: 'Inactivo',
    color: 'grey',
    icon: 'hourglass half',
  },
};

// export const EXPENSE_STATES = {
//   PAID: {
//     id: 'PAID',
//     title: 'Pagados',
//     singularTitle: 'Pagado',
//     color: 'green',
//     icon: 'check',
//   },
//   PENDING: {
//     id: 'PENDING',
//     title: 'Pendientes',
//     singularTitle: 'Pendiente',
//     color: 'orange',
//     icon: 'hourglass half',
//   },
//   CANCELLED: {
//     id: 'CANCELLED',
//     title: 'Anulados',
//     singularTitle: 'Anulado',
//     color: 'red',
//     icon: 'ban',
//   }
// };

export const EMPTY_EXPENSE = { name: '', comments: '', amount: '', expirationDate: '' };
// export const EMPTY_FILTERS = { id: '', name: '', categories: "", state: EXPENSE_STATES.PAID.id };
export const EMPTY_FILTERS = { id: '', name: '', categories: "", state: EXPENSE_STATES.ACTIVE.id };

export const EXPENSES_STATE_OPTIONS = Object.values(EXPENSE_STATES)
  .map(({ id, title, color }) => ({
    key: id,
    text: (
      <Flex $alignItems="center" $justifyContent="space-between">
        {title}&nbsp;<Label width="fit-content" color={color} circular empty />
      </Flex>
    ),
    value: id
  }));
