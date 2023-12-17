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
        const sortedBudgets = fetchBudgets?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setBudgets(sortedBudgets);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar presupuestos:', error);
      };
    };
    fetchData();
  }, [router]);

  return (
      <BudgetsPage budgets={budgets} isLoading={isLoading} />
  )
};

export default Budgets;
