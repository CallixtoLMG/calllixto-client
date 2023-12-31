"use client";
import { useGetBudget } from "@/api/budgets";
import BudgetForm from "@/components/budgets/BudgetForm";
import { PageHeader, Loader, NoPrint } from "@/components/layout";
import { PAGES } from "@/constants";
import { useUserData, useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";

const Budget = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const user = useUserData();
  const { budget, isLoading } = useGetBudget(params.id);

  if (!isLoading && !budget) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <>
      <NoPrint>
        <PageHeader title="Presupuesto" />
      </NoPrint>
      <Loader active={isLoading}>
        <BudgetForm readonly user={user} budget={budget} />
      </Loader>
    </>
  )
};

export default Budget;
