"use client";
import { useListBudgets } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetPage";
import { useBreadcrumContext, Loader } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";

const Budgets = () => {
  useValidateToken();
  const { budgets, isLoading } = useListBudgets();
  const { setLabels } = useBreadcrumContext();

  useEffect(() => {
    setLabels(['Presupuestos']);
  }, [setLabels]);

  return (
    <Loader active={isLoading}>
      <BudgetsPage budgets={budgets} />
    </Loader>
  )
};

export default Budgets;
