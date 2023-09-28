"use client";
import CustomerForm from "@/components/customers/CustomerForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { MainContainer } from "./styles";

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

    fetch("https://v1zcj5c6i3.execute-api.sa-east-1.amazonaws.com/f222ba6b-b1f9-4ed8-b264-79418f7dfc22/customers", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
    toast.success("Cliente creado exitosamente");
    router.push(PAGES.CUSTOMERS.BASE)
  };

  return (
    <MainContainer>
      <CustomerForm onSubmit={create} />
    </MainContainer>
  )
};

export default CreateCustomer;