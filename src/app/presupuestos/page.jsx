"use client";
import { useListBudgets } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetPage";
import { useBreadcrumContext, Loader, useNavActionsContext } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PAGES } from "@/constants";

const Budgets = () => {
  useValidateToken();
  const { data: budgets, isLoading } = useListBudgets();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels(['Presupuestos']);
  }, [setLabels]);

  useEffect(() => {
    const actions = [
      {
        id: 1,
        icon: 'add',
        color: 'green',
        onClick: () => { push(PAGES.BUDGETS.CREATE) },
        text: 'Crear'
      }
    ];
    setActions(actions);
  }, [push, setActions]);

  return (
    <Loader active={isLoading}>
      <BudgetsPage budgets={budgets} />
    </Loader>
  )
};

export default Budgets;
