"use client"
import { getBudget } from "@/api/budgets";
import PDFfile from "@/components/budgets/PDFfile";
import { Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useValidateToken } from "@/hooks/userData";

const PDF = ({ params }) => {
  const [budget, setBudget] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useRouter();
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
        const budget = await getBudget(params.id, requestOptions);
        if (!budget) {
          push(PAGES.NOT_FOUND.BASE);
          return;
        };
        setIsLoading(false);
        setBudget(budget);
      } catch (error) {
        console.error('Error al cargar PDF:', error);
      };
    };

    fetchData();
  }, [params.id, push, token]);

  return (
    <Loader active={isLoading}>
      <PDFfile budget={budget} />
    </Loader>
  )
};

export default PDF;
