"use client";
import CustomerForm from "@/components/customers/CustomerForm";
import { PAGES } from "@/constants";
import { CLIENTID, PATHS, URL } from "@/fetchUrls";
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

    fetch(`${URL}${CLIENTID}${PATHS.CUSTOMERS}`, requestOptions)
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
    setTimeout(() => {
      router.push(PAGES.CUSTOMERS.BASE);
    }, 500);
  };

  return (
    <CustomerForm onSubmit={create} />
  )
};

export default CreateCustomer;