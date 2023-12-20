"use client"
import { getBudget } from "@/api/budgets";
import { getUserData } from "@/api/userData";
import PDFfile from "@/components/PDFfile";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PDF = ({ params }) => {
  const [pdfBudget, setPdfBudget] = useState();
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
        const fetchBudget = await getBudget(params.id, requestOptions);
        if (!fetchBudget) {
          push(PAGES.NOTFOUND.BASE);
          return;
        };
        setPdfBudget(fetchBudget);
      } catch (error) {
        console.error('Error al cargar PDF:', error);
      };
    };
    validateToken();
    fetchData();
  }, [params.id, router]);

  return (
    <PDFfile budget={pdfBudget} />
  )
};

export default PDF;