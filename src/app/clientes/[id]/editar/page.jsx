"use client"
import CustomerForm from "@/components/customers/CustomerForm";
import { PAGES } from "@/constants";
import { CLIENTID, PATHS, URL } from "@/fetchUrls";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

async function showCustomer(id) {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.CUSTOMERS}/${id}`);
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
  }, [params.id]);

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

    fetch(`${URL}${CLIENTID}${PATHS.CUSTOMERS}/${params.id}`, requestOptions)
      .then(async response => {
        let res = await response.text()
        res = JSON.parse(res)
        if (res.statusOk) {
          toast.success("Cliente modificado exitosamente");
        } else {
          toast.error(res.message);
        };
      })
      .catch(error => console.log('error', error));
    router.push(PAGES.CUSTOMERS.BASE)
  };

  return (
    <>
      {customer && <CustomerForm customer={customer.customer} onSubmit={editCustomer} />}
    </>
  )
};

export default EditCustomer;