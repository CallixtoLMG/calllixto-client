"use client";
import { useListBudgets } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetPage";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Budgets = () => {
  useValidateToken();
  const { data, isLoading } = useListBudgets({ sort: 'date', order: false });
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels(['Presupuestos']);
  }, [setLabels]);

  const { budgets } = useMemo(() => {
    return { budgets: data?.budgets }
  }, [data]);

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
