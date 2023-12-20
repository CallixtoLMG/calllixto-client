"use client"
import { getBudget } from "@/api/budgets";
import { getUserData } from "@/api/userData";
import { HeaderContainer } from "@/components/budgets/BudgetPage/styles";
import ShowBudget from "@/components/budgets/ShowBudget";
import Loader from "@/components/layout/Loader";
import NoPrint from "@/components/layout/NoPrint";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Budget = ({ params }) => {
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true)
  const [budget, setBudget] = useState();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      push(PAGES.LOGIN.BASE);
    };
    const validateToken = async () => {
      try {
        const userData = await getUserData();
        if (!userData.isAuthorized) {
          push(PAGES.LOGIN.BASE);
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
        const fetchBudget = await getBudget(params.id, requestOptions);
        if (!fetchBudget) {
          push(PAGES.NOTFOUND.BASE);
          return;
        };
        setBudget(fetchBudget);
        setIsLoading(false)
      } catch (error) {
        console.error('Error al cargar presupuesto:', error);
      };
    };
    validateToken();
    fetchData();
  }, [params.id]);

  return (
    <>
      <NoPrint>
        <HeaderContainer>
          <PageHeader title="Presupuesto" />
        </HeaderContainer >
      </NoPrint>
      <Loader active={isLoading}>
        <ShowBudget budget={budget} />
      </Loader>
    </>

  )
};

export default Budget;
