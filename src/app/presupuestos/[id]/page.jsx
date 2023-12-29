"use client"
import { getBudget } from "@/api/budgets";
import ShowBudget from "@/components/budgets/ShowBudget";
import { PageHeader, Loader, NoPrint } from "@/components/layout";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Budget = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true)
  const [budget, setBudget] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const budget = await getBudget(params.id);

      if (!budget) {
        push(PAGES.NOT_FOUND.BASE);
        return;
      };

      setBudget(budget);
      setIsLoading(false);
    };

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
