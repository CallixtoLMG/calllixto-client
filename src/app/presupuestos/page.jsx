"use client";

import BudgetsPage from "../../components/budgets/BudgetPage";

const headerCell = [
  {
    name: "Codigo",
    id: 1
  },
  {
    name: "Cliente",
    id: 2
  },
  {
    name: "Fecha de creacion",
    id: 3
  },
  {
    name: "Monto total",
    id: 4
  },
];

function Presupuesto() {
  const budgets = [{
    id: 1,
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
    id: 3,
    customer: "José",
    createdAt: "2021-10-10",
    totalAmount: 2000
  }];

  return (
    <BudgetsPage budgets={budgets} />
  )
};

export default Presupuesto;