import { Flex, Label } from "@/common/components/custom";
import { CommentTooltip } from "@/common/components/tooltips";

export const ATTRIBUTES = { ID: "id", NAME: "name", CATEGORY: "category", PAYMENT_DETAILS: "paymentDetails", TAGS: "tags", AMOUNT: "amount", EXPIRATION: "expiration", COMMENT: "comments", STATE: "state" };

export const LIST_EXPENSES_QUERY_KEY = 'listExpenses';
export const GET_EXPENSE_QUERY_KEY = 'getExpense';
export const EXPENSES_FILTERS_KEY = 'expensesFilters';

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

export const HEADERS = [
  {
    id: 1,
    title: "Id",
    width: 1,
    value: (expense) => expense.id
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
    value: (expense) =>
      <Flex justifyContent="space-between">
        {expense.name}
        {expense.comments && <CommentTooltip comment={expense.comments} />}
      </Flex>
  },
  {
    id: 3,
    title: "Categorias",
    align: "left",
    value: (expense) => { expense.category }
  },
  {
    id: 4,
    title: "Monto",
    align: "left",
    value: (expense) => { expense.amount }
  }
];

export const EMPTY_FILTERS = { state: EXPENSE_STATES.ACTIVE.id, id: '', name: '', category: "" };

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
