"use client"
import { getBudget } from "@/api/budgets";
import { getUserData } from "@/api/userData";
import ShowBudget from "@/components/budgets/ShowBudget";
import { PageHeader, Loader, NoPrint } from "@/components/layout";
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
  }, [params.id, push]);

  return (
    <>
      <NoPrint>
        <PageHeader title="Presupuesto" />
      </NoPrint>
      <Loader active={isLoading}>
        <ShowBudget budget={budget} />
      </Loader>
    </>
  )
};

export default Budget;
