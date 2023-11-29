"use client";
import { budgetsList } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetPage";
import { useEffect, useState } from "react";

const Budgets = () => {
  const [budgets, setBudgets] = useState();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchData = async () => {
      try {
        const requestOptions = {
          method: 'GET',
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: "no-store",
        };
        const fetchBudgets = await budgetsList(requestOptions);
        setBudgets(fetchBudgets);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      };
    };
    fetchData();
  }, []);

  return (
    <BudgetsPage budgets={budgets} />
  )
};

export default Budgets;