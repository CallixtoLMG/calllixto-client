"use client"
import { edit, getCustomer } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { useEffect, useState } from "react";

const EditCustomer = ({ params }) => {
  const [customer, setCustomer] = useState(null);
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
    };
    fetchData();
  }, [params.id]);

  return (
    <>
      {customer && <CustomerForm customer={customer} onSubmit={edit} />}
    </>
  )
};

export default EditCustomer;