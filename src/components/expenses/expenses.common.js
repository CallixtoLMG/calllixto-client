import { Flex } from '@/components/common/custom';
import { CommentTooltip } from "@/components/common/tooltips";

const ATTRIBUTES = { ID: "id", NAME: "name", CATEGORY: "category", PAYMENT_DETAILS: "paymentDetails", TAGS: "tags", AMOUNT: "amount", EXPIRATION: "expiration", COMMENT: "comments", STATE: "state" };

const EXPENSE_COLUMNS = [
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
  }
];

export {
  ATTRIBUTES, EXPENSE_COLUMNS
};

