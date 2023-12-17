"use client"
import { getBudget } from "@/api/budgets";
import ShowBudget from "@/components/budgets/ShowBudget";
import Loader from "@/components/layout/Loader";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Budget = ({ params }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true)
  const [budget, setBudget] = useState();
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
        const fetchBudget = await getBudget(params.id, requestOptions);
        setBudget(fetchBudget);
        setIsLoading(false)
      } catch (error) {
        console.error('Error al cargar presupuesto:', error);
      };
    };
    fetchData();
  }, [params.id])

  return (
    <Loader active={isLoading}>
      <ShowBudget budget={budget} />
    </Loader>
  )
};

export default Budget;
