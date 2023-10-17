"use client";

import BudgetsPage from "../../components/budgets/BudgetPage";

async function loadBudgets() {
  const res = await fetch("https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/budgets", { cache: "no-store" });
  const data = await res.json()
  return data
};

async function Presupuesto() {

  const budgets = await loadBudgets()

  return (
    <BudgetsPage budgets={budgets.budgets} />
  )
};

export default Presupuesto;