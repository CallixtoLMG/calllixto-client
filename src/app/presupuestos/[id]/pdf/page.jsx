"use client"
import { getBudget } from "@/api/budgets";
import PDFfile from "@/components/budgets/PDFfile";
import { Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useValidateToken } from "@/hooks/userData";

const PDF = ({ params }) => {
  useValidateToken();
  const [budget, setBudget] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const budget = await getBudget(params.id);

      if (!budget) {
        push(PAGES.NOT_FOUND.BASE);
        return;
      };

      setIsLoading(false);
      setBudget(budget);
    };

    fetchData();
  }, [params.id, push]);

  return (
    <Loader active={isLoading}>
      <PDFfile budget={budget} />
    </Loader>
  )
};

export default PDF;
