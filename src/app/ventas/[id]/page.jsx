import { getBudgetById } from "@/api/budgets.server";
import { PAGE_CONSTANTS } from "@/common/constants/pages";
import { redirect } from "next/navigation";
import BudgetPage from "./BudgetPage";

const Budget = async ({ params }) => {
  const { budget, status } = await getBudgetById(params?.id);

  if ([401, 403].includes(status)) {
    redirect(PAGE_CONSTANTS.LOGIN.BASE);
  }

  if (!budget) {
    redirect(PAGE_CONSTANTS.NOT_FOUND.BASE);
  }

  if (budget.state === "DRAFT") {
    redirect(`${PAGE_CONSTANTS.BUDGETS.BASE}/${params?.id}/${PAGE_CONSTANTS.BUDGETS.DRAFT_SEGMENT}`);
  }

  return <BudgetPage budget={budget} />;
};

export default Budget;
