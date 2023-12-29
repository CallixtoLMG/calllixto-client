"use client";
import { useListBudgets } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetPage";
import { PageHeader, Loader } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";

const Budgets = () => {
  useValidateToken();
  const { budgets, isLoading } = useListBudgets();

  return (
    <>
      <PageHeader title="Presupuestos" />
      <Loader active={isLoading}>
        <BudgetsPage budgets={budgets} />
      </Loader>
    </>
  )
};

export default Budgets;
