import { getEntityById } from "@/api/entity";
import { ENTITIES } from "@/common/constants/entities";
import { BUDGETS_PAGE } from "@/common/constants/routes";
import { redirect } from "next/navigation";
import BudgetPageClient from "./page.client";

const Budget = async ({ params }) => {
  const response = await getEntityById({
    id: params?.id,
    path: ENTITIES.BUDGETS,
    responseEntity: ENTITIES.BUDGET,
  });
  const budget = {
    ...response,
    globalDiscount: response.globalDiscount ?? 0,
    additionalCharge: response.additionalCharge ?? 0,
  };

  if (budget.state === "DRAFT") {
    redirect(`${BUDGETS_PAGE}/${params.id}/borrador`);
  }

  return <BudgetPageClient budget={budget} />;
};

export default Budget;
