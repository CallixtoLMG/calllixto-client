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

    fetch("https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/customers", requestOptions)
      .then(async response => {
        let res = await response.text()
        res = JSON.parse(res)
        if (res.statusOk) {
          toast.success("Cliente creado exitosamente");
        } else {
          toast.error(res.message);
        };
      })
      .catch(error => console.log('error', error));
    router.push(PAGES.CUSTOMERS.BASE)
  };

  return (
    <CustomerForm onSubmit={create} />
  )
};

export default CreateCustomer;