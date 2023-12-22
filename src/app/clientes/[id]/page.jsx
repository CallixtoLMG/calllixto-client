"use client";
import { getCustomer } from "@/api/customers";
import { getUserData } from "@/api/userData";
import ShowCustomer from "@/components/customers/ShowCustomer";
import Loader from "@/components/layout/Loader";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Customer = ({ params }) => {
  const { push } = useRouter();
  const [customer, setCustomer] = useState();
  const [isLoading, setIsLoading] = useState(true)
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
        const fetchCustomer = await getCustomer(params.id, requestOptions);
        if (!fetchCustomer) {
          push(PAGES.NOTFOUND.BASE);
          return;
        };
        setCustomer(fetchCustomer);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar cliente:', error);
      };
    };
    validateToken();
    fetchData();
  }, [params.id]);

  return (
    <>
      <PageHeader title="Cliente" />
      <Loader active={isLoading}>
        <ShowCustomer customer={customer} />
      </Loader>
    </>
  );
};

export default Customer;
