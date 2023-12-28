"use client"
import { getBudget } from "@/api/budgets";
import ShowBudget from "@/components/budgets/ShowBudget";
import { PageHeader, Loader, NoPrint } from "@/components/layout";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Budget = ({ params }) => {
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true)
  const [budget, setBudget] = useState();
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
        const fetchBudget = await getBudget(params.id, requestOptions);
        if (!fetchBudget) {
          push(PAGES.NOT_FOUND.BASE);
          return;
        };
        setBudget(fetchBudget);
        setIsLoading(false)
      } catch (error) {
        console.error('Error al cargar presupuesto:', error);
      };
    };

    fetchData();
  }, [params.id, push, token]);

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
