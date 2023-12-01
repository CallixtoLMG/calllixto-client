"use client"
import { getBudget } from "@/api/budgets";
import ShowBudget from "@/components/budgets/ShowBudget";
import Loader1 from "@/components/layout/Loader";
import { useEffect, useState } from "react";

const Budget = ({ params }) => {
  const [loader, setLoader] = useState(true)
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
        setLoader(false)
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      };
    };
    fetchData();
  }, [params.id])

  return (
    <Loader1 active={loader}>
      <ShowBudget budget={budget} />
    </Loader1>
  )
};

export default Budget;
