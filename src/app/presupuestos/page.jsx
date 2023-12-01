"use client";
import { budgetsList } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetPage";
import Loader1 from "@/components/layout/Loader";
import { useEffect, useState } from "react";

const Budgets = () => {
  const [loader, setLoader] = useState(true)
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
        setLoader(false)
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      };
    };
    fetchData();
  }, []);

  return (
    <Loader1 active={loader}>
      <BudgetsPage budgets={budgets} />
    </Loader1>
  )
};

export default Budgets;
