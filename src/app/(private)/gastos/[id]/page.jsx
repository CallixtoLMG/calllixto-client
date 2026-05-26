import { getEntityById } from "@/api/entity";
import { ENTITIES } from "@/common/constants/entities";
import ExpensePageClient from "./page.client";

const Expense = async ({ params }) => {
  const expense = await getEntityById({
    id: params?.id,
    path: ENTITIES.EXPENSES,
    responseEntity: ENTITIES.EXPENSE,
  });

  return <ExpensePageClient expense={expense} />;
};

export default Expense;
