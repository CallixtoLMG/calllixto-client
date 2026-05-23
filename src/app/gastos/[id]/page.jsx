import { getExpenseById } from "@/api/expenses.server";
import { PAGE_CONSTANTS } from "@/common/constants/pages";
import { redirect } from "next/navigation";
import ExpensePage from "./ExpensePage";

const Expense = async ({ params }) => {
  const { expense, status } = await getExpenseById(params?.id);

  if ([401, 403].includes(status)) {
    redirect(PAGE_CONSTANTS.LOGIN.BASE);
  }

  if (!expense) {
    redirect(PAGE_CONSTANTS.NOT_FOUND.BASE);
  }

  return <ExpensePage expense={expense} />;
};

export default Expense;
