"use client";
import BudgetForm from "@/components/budgets/BudgetForm";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MainContainer } from "./styles";

const create = (budget) => {
  var requestOptions = {
    method: 'POST',
    body: JSON.stringify(budget),
    redirect: "follow",
    headers: {
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
};


const CreateBudget = () => {

  const [productsList, setProductsList] = useState(null)
  const [customersList, setCustomersList] = useState(null)

  useEffect(async () => {
    async function loadProducts() {
      try {
        const res = await fetch("https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/products", { cache: "no-store" });
        const data = await res.json();
        return data;
      } catch (error) {
        console.error('Error al cargar productos:', error);
        throw new Error('Ocurrió un error al cargar productos');
      }
    }

    const fetchData = await loadProducts();
    const products = fetchData.products;
    products.forEach(product => {
      product["key"] = product.code;
      product["value"] = product.name;
      product["text"] = product.name;
    });
    setProductsList(products);
  }, []);

//   useEffect(() => {
//   async function fetchData() {
//     // You can await here
//     const response = await MyAPI.getData(someId);
//     // ...
//   }
//   fetchData();
// }, [someId]);

  useEffect(async () => {
    async function loadCustomers() {
      try {
        const res = await fetch("https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/customers", { cache: "no-store" });
        const data = await res.json();
        return data;
      } catch (error) {
        console.error('Error al cargar clientes:', error);
        throw new Error('Ocurrió un error al cargar clientes');
      }
    }

    const fetchData = await loadCustomers();
    const customers = fetchData.customers;
    customers.forEach(customer => {
      customer["key"] = customer.id;
      customer["value"] = customer.name;
      customer["text"] = customer.name;
    });
    setCustomersList(customers);
  }, []);

  return (
    <MainContainer>
      <BudgetForm onSubmit={create} products={productsList}  customers={customersList}/>
    </MainContainer>
  )
}


export default CreateBudget;