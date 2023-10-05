"use client"
import CustomerForm from "@/components/customers/CustomerForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

async function showCustomer(code) {
  const res = await fetch(`https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/customers/${code}`);
  const data = await res.json()
  return data
};

function EditCustomer({ params }) {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    async function customerData() {
      const data = await showCustomer(params.id);
      setCustomer(data);
    };
    customerData();
  }, []);

  function editCustomer(customer) {
    var requestOptions = {
      body: JSON.stringify(customer),
      method: 'PUT',
      redirect: 'follow',
      Headers: {
        'Content-Type': 'application/json'
      },
      cache: "no-store",
    };

    fetch(`https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/customers/${params.id}`, requestOptions)
      .then(async response => {
        let res = await response.text()
        res = JSON.parse(res)
        if (res.message === "Customer Updated") {
          toast.success("Cliente modificado exitosamente", { duration: 4000, position: "top-center" });
        } else {
          toast.error(res.message, { duration: 4000, position: "top-center" });
        };
      })
      .catch(error => console.log('error', error));
    router.push(PAGES.CUSTOMERS.BASE)
  };

  return (
    <>
      {customer && <CustomerForm customer={customer} onSubmit={editCustomer} />}
    </>
  )
};

export default EditCustomer;