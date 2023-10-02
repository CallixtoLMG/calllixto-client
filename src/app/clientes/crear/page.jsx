"use client";
import CustomerForm from "@/components/customers/CustomerForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const CreateCustomer = () => {
  const router = useRouter()
  const create = (customer) => {
    var requestOptions = {
      method: 'POST',
      body: JSON.stringify(customer),
      redirect: "follow",
      Headers: {
        'Content-type': 'application-json'
      },
      cache: "no-store"
    };

    fetch("https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/customers", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
    toast.success("Cliente creado exitosamente");
    router.push(PAGES.CUSTOMERS.BASE)
  };

  return (
    <CustomerForm create={create} />
  )
};

export default CreateCustomer;