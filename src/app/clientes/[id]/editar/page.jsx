"use client"
import { edit, getCustomer } from "@/api/customers";
import { getUserData } from "@/api/userData";
import CustomerForm from "@/components/customers/CustomerForm";
import Loader from "@/components/layout/Loader";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditCustomer = ({ params }) => {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
    };
    const validateToken = async () => {
      try {
        const userData = await getUserData();
        if (!userData.isAuthorized) {
          router.push(PAGES.LOGIN.BASE)
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
      setCustomer(data);
      setIsLoading(false)
    };
    validateToken();
    fetchData();
  }, [params.id, router]);

  return (
    <>
      {customer && 
        <Loader active={isLoading}>  
          <CustomerForm customer={customer} onSubmit={edit} />
        </Loader>
      }
    </>
  )
};

export default EditCustomer;
