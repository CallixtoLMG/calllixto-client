import { Box, Flex, OverflowWrapper } from "@/common/components/custom";
import { PriceLabel } from "@/common/components/form";
import { CommentTooltip, TagsTooltip } from "@/common/components/tooltips";
import { ICONS, SELECT_ALL_OPTION } from "@/common/constants";
import { getLabelColor } from "@/common/utils";
import { Label } from "semantic-ui-react";

export const LIST_EXPENSES_QUERY_KEY = 'listExpenses';
export const GET_EXPENSE_QUERY_KEY = 'getExpense';
export const EXPENSES_FILTERS_KEY = 'expensesFilters';

export const LIST_ATTRIBUTES = ["id", "name", "categories", "tags", "amount", "expirationDate", "comments", "state", "total", "paymentsMade", "paidAmount", "pendingAmount"];

export const HEADERS = [
  {
    id: 1,
    title: "Id",
    width: 1,
    value: (expense) => (
      <Box width="60px">
        <Label ribbon color={getLabelColor(expense, EXPENSE_STATES)}>
          {expense.id}
        </Label>
      </Box>
    )
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
          {expense.categories && <TagsTooltip icon={ICONS.BOXES} maxWidthOverflow="8vw" tooltip="true" tags={expense.categories} />}
        </Flex>
      );
    }
  },
  {
    id: 4,
    title: "Monto",
    align: "left",
    value: (expense) => <PriceLabel value={expense.amount ?? 0} />,
  },
  {
    id: 5,
    title: "Pagado",
    align: "left",
    value: (expense) => <PriceLabel value={expense.paidAmount ?? 0} />,
  },
  {
    id: 6,
    title: "Pendiente",
    align: "left",
    value: (expense) => <PriceLabel value={expense?.pendingAmount ?? 0} />,
  }
];

export const EXPENSE_STATES = {
  PAID: {
    id: 'PAID',
    title: 'Pagados',
    singularTitle: 'Pagado',
    color: 'green',
    icon: 'check',
  },
  PENDING: {
    id: 'PENDING',
    title: 'Pendientes',
    singularTitle: 'Pendiente',
    color: 'orange',
    icon: 'hourglass half',
  },
  CANCELLED: {
    id: 'CANCELLED',
    title: 'Anulados',
    singularTitle: 'Anulado',
    color: 'red',
    icon: 'ban',
  }
};

export const EMPTY_EXPENSE = { name: '', comments: '', amount: '', expirationDate: '', paymentsMade: [] };
export const EMPTY_FILTERS = { id: '', name: '', categories: "", state: SELECT_ALL_OPTION.value, };

export const EXPENSES_STATE_OPTIONS = [
  SELECT_ALL_OPTION,
  ...Object.values(EXPENSE_STATES).map(({ id, title, color }) => (
    {
      key: id,
      text: (
        <Flex $alignItems="center" $justifyContent="space-between">
          {title}&nbsp;<Label color={color} circular empty />
        </Flex>
      ),
      value: id
    }))
];
