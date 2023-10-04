"use client";

import BudgetsPage from "../../components/budgets/BudgetPage";

async function loadBudgets() {
  const res = await fetch("https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/budgets", { cache: "no-store" });
  const data = await res.json()
  return data
};

async function Presupuesto() {

  const budgets = await loadBudgets()

  const budgets1 = [{
    id: 32,
    customer: "Pepito",
    createdAt: "2021-10-10",
    totalAmount: 1000
  },
  {
    id: 2,
    customer: "Roberto",
    createdAt: "2021-10-10",
    totalAmount: 1500
  },
  {
    id: 13,
    customer: "José",
    createdAt: "2021-10-10",
    totalAmount: 2000
  }];

  return (
    <BudgetsPage budgets={budgets} />
  )
};

export default Presupuesto;