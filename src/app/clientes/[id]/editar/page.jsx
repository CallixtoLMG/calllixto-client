"use client"
import { edit, getCustomer } from "@/api/customers";
import { getUserData } from "@/api/userData";
import CustomerForm from "@/components/customers/CustomerForm";
import { PageHeader, Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditCustomer = ({ params }) => {
  const { push } = useRouter();
  const [customer, setCustomer] = useState(null);
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
    async function fetchData() {
      var requestOptions = {
        method: 'GET',
        redirect: 'follow',
        headers: {
          authorization: `Bearer ${token}`
        },
        cache: "no-store",
      };
      const data = await getCustomer(params.id, requestOptions);
      if (!data) {
        push(PAGES.NOT_FOUND.BASE);
        return;
      };
      setCustomer(data);
      setIsLoading(false)
    };
    validateToken();
    fetchData();
  }, [params.id, push]);

  return (
    <>
      <PageHeader title="Actualizar Cliente" />
      <Loader active={isLoading}>
        <CustomerForm customer={customer} onSubmit={edit} />
      </Loader>
    </>
  )
};

export default EditCustomer;
