"use client";
import { useGetBudget } from "@/api/budgets";
import BudgetForm from "@/components/budgets/BudgetForm";
import { useBreadcrumContext, Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useUserData, useValidateToken } from "@/hooks/userData";
import { formatedDate } from "@/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Budget = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const user = useUserData();
  const { budget, isLoading } = useGetBudget(params.id);
  const { setLabels } = useBreadcrumContext();

  useEffect(() => {
    setLabels(['Presupuestos', budget ? `${budget?.customer?.name} (${formatedDate(budget?.createdAt)})` : '']);
  }, [setLabels, budget]);

  if (!isLoading && !budget) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <Loader active={isLoading}>
      <BudgetForm readonly user={user} budget={budget} />
    </Loader>
  )
};

export default Budget;
