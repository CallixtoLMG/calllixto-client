"use client";
import BudgetForm from "@/components/budgets/BudgetForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { MainContainer } from "./styles";

//pedir clientes y los productos

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

    fetch("https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/budgets", requestOptions)
      .then(async response => {
        let res = await response.text()
        res = JSON.parse(res)
        if (res.statusOk) {
          toast.success("Presupuesto creado exitosamente");
        } else {
          toast.error(res.message);
        };
      })
      .catch(error => console.log('error', error));
    router.push(PAGES.BUDGETS.BASE);
  };

  return (
    <MainContainer>
      <BudgetForm onSubmit={create} />
    </MainContainer>
  )
}
export default CreateBudget;