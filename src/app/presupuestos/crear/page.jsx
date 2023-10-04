"use client";
import { loadCustomers } from "@/app/clientes/page";
import BudgetForm from "@/components/budgets/BudgetForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { MainContainer } from "./styles";

const customers = loadCustomers();

const CreateBudget = () => {
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

    fetch("https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/budgets", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
    toast.success("Presupuesto creado exitosamente");
    router.push(PAGES.BUDGETS.BASE)
  };

  return (
    <MainContainer>
      <BudgetForm customers={customers} onSubmit={create} />
    </MainContainer>
  )
}
export default CreateBudget;