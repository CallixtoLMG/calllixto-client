"use client"
import { getBudget } from "@/api/budgets";
import { getUserData } from "@/api/userData";
import PDFfile from "@/components/budgets/PDFfile";
import { Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PDF = ({ params }) => {
  const [budget, setBudget] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useRouter();
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
        const budget = await getBudget(params.id, requestOptions);
        if (!budget) {
          push(PAGES.NOTFOUND.BASE);
          return;
        };
        setIsLoading(false);
        setBudget(budget);
      } catch (error) {
        console.error('Error al cargar PDF:', error);
      };
    };
    validateToken();
    fetchData();
  }, [params.id, push]);

  return (
    <Loader active={isLoading}>
      <PDFfile budget={budget} />
    </Loader>
  )
};

export default PDF;