"use client";

import BudgetsPage from "../../components/budgets/BudgetPage";

function Presupuesto() {
  const budgets = [{
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