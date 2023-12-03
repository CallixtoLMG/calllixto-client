"use client"
import { getBudget } from "@/api/budgets";
import ShowBudget from "@/components/budgets/ShowBudget";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Budget = ({ params }) => {
  const router = useRouter();
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
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      };
    };
    fetchData();
  }, [params.id])

  return (
    <ShowBudget budget={budget} />
  )
};

export default Budget;
