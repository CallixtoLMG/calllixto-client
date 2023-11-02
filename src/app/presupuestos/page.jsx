"use client";

import BudgetsPage from "../../components/budgets/BudgetPage";

async function loadBudgets() {
  const res = await fetch("https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/budgets", { cache: "no-store" });
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