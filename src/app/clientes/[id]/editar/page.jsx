"use client"
import { edit, getCustomer } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import Loader1 from "@/components/layout/Loader";
import { useEffect, useState } from "react";

const EditCustomer = ({ params }) => {
  const [customer, setCustomer] = useState(null);
  const [loader, setLoader] = useState(true)
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
      setLoader(false)
    };
    fetchData();
  }, [params.id]);

  return (
    <>
      {customer && 
        <Loader1 active={loader}>  
          <CustomerForm customer={customer} onSubmit={edit} />
        </Loader1>
      }
    </>
  )
};

export default EditCustomer;
