import { getEntityById } from "@/api/entity";
import { PAGE_CONSTANTS } from "@/common/constants/pages";
import { redirect } from "next/navigation";
import PageClient from "./page.client";

const Budget = async ({ params }) => {
  const budgetResponse = await getEntityById({ id: params?.id, path: "budgets", responseEntity: "budget" });
  const budget = {
    ...budgetResponse,
    globalDiscount: budgetResponse.globalDiscount ?? 0,
    additionalCharge: budgetResponse.additionalCharge ?? 0,
  };

  if (budget.state === "DRAFT") {
    redirect(`${PAGE_CONSTANTS.BUDGETS.BASE}/${params?.id}/${PAGE_CONSTANTS.BUDGETS.DRAFT_SEGMENT}`);
  }

  return <PageClient budget={budget} />;
};

export default Budget;
