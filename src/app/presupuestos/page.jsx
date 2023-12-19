"use client";
import { budgetsList } from "@/api/budgets";
import { getUserData } from "@/api/userData";
import BudgetsPage from "@/components/budgets/BudgetPage";
import { HeaderContainer } from "@/components/budgets/BudgetPage/styles";
import Loader from "@/components/layout/Loader";
import PageHeader from "@/components/layout/PageHeader";
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
    const validateToken = async () => {
      try {
        const userData = await getUserData();
        if (!userData.isAuthorized) {
          router.push(PAGES.LOGIN.BASE)
        };
      } catch (error) {
        console.error('Error, ingreso no valido(token):', error);
      };
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
        const budgets = await budgetsList(requestOptions);
        setBudgets(budgets);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar presupuestos:', error);
      };
    };
    validateToken();
    fetchData();
  }, [router]);

  return (
    <>
      <HeaderContainer>
        <PageHeader title="Presupuestos" />
      </HeaderContainer>
      <Loader active={isLoading}>
        <BudgetsPage budgets={budgets} />
      </Loader>
    </>
  )
};

export default Budgets;
