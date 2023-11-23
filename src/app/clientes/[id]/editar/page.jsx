"use client"
import { edit } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { CLIENTID, PATHS, URL } from "@/fetchUrls";
import { useEffect, useState } from "react";

async function get(id) {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.CUSTOMERS}/${id}`);
  const data = await res.json();
  return data;
};

function EditCustomer({ params }) {
  const id = params.id;
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    async function customerData() {
      const data = await get(params.id);
      setCustomer(data);
    };
    customerData();
  }, [params.id]);

  return (
    <>
      {customer && <CustomerForm customer={customer.customer} onSubmit={edit} id={id} />}
    </>
  )
};

export default EditCustomer;