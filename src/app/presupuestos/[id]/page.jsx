"use client"
import { getBudget } from "@/api/budgets";
import ShowBudget from "@/components/budgets/ShowBudget";
import Loader from "@/components/layout/Loader";
import { useEffect, useState } from "react";

const Budget = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [budget, setBudget] = useState();
  useEffect(() => {
    const token = localStorage.getItem('token');
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
        console.error('Error al cargar clientes:', error);
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
