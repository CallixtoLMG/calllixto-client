"use client";
import { loadBudgets } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetPage";

async function Budgets() {

  const budgets = await loadBudgets();
  return (
    <BudgetsPage budgets={budgets.budgets} />
  )
};

export default Budgets;