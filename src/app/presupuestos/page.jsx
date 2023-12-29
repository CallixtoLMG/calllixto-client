"use client";
import { list } from "@/api/budgets";
import BudgetsPage from "@/components/budgets/BudgetPage";
import { PageHeader, Loader } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Budgets = () => {
  useValidateToken();
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const budgets = await list();
      setBudgets(budgets);
      setIsLoading(false);
    };
    fetchData();
  }, [push]);

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
