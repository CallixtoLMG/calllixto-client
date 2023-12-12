"use client";
import { budgetsList } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetPage";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Budgets = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true)
  const [budgets, setBudgets] = useState();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
    };
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
        setIsLoading(false)
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      };
    };
    fetchData();
  }, []);

  return (
      <BudgetsPage budgets={budgets} isLoading={isLoading} />
  )
};

export default Budgets;
