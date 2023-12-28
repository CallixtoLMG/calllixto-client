"use client";
import { budgetsList } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetPage";
import { PageHeader, Loader } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Budgets = () => {
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState();
  const token = useValidateToken();

  useEffect(() => {
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
        const budgets = await budgetsList(requestOptions);
        setBudgets(budgets);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar presupuestos:', error);
      };
    };

    fetchData();
  }, [push, token]);

  return (
    <>
      <PageHeader title="Presupuestos" />
      <Loader active={isLoading}>
        <BudgetsPage budgets={budgets} />
      </Loader>
    </>
  )
};

export default Budgets;
