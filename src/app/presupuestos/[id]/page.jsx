"use client";
import { useUserContext } from "@/User";
import { useGetBudget } from "@/api/budgets";
import BudgetForm from "@/components/budgets/BudgetForm";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { Rules } from "@/visibilityRules";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Budget = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { userData } = useUserContext();
  const { data: budget, isLoading } = useGetBudget(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const { role } = useUserContext();
  
  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Presupuestos', budget && budget?.id]);
  }, [setLabels, budget]);

  if (!isLoading && !budget) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  useEffect(() => {
    if (budget) {
      const visibilityRules = Rules(role);
      const actions = visibilityRules.canSeeButtons ? [
        {
          id: 1,
          icon: 'copy',
          color: 'green',
          onClick: () => { push(PAGES.BUDGETS.CLONE(budget.id)) },
          text: 'Clonar'
        },
      ] : [];
      setActions(actions);
    }
  }, [budget, push, role, setActions]);

  return (
    <Loader active={isLoading}>
      <BudgetForm readonly user={userData} budget={budget} />
    </Loader>
  )
};

export default Budget;
