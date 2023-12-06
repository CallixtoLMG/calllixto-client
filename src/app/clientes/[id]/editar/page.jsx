"use client"
import { edit, getCustomer } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import Loader from "@/components/layout/Loader";
import { useEffect, useState } from "react";

const EditCustomer = ({ params }) => {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const token = localStorage.getItem('token');
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
    fetchData();
  }, [params.id]);

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
