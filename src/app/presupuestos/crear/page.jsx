"use client";
import { create } from "@/api/budgets";
import { customersList } from "@/api/customers";
import { productsList } from "@/api/products";
import BudgetForm from "@/components/budgets/BudgetForm";
import { useEffect, useState } from "react";

const CreateBudget = () => {

  const [products, setProductsList] = useState(null)
  const [customers, setCustomersList] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const productsFecthData = await productsList();
      const productsFilteredList = productsFecthData.map(product => ({
        price: product.price,
        key: product.code,
        code: product.code,
        value: product.name,
        text: product.name,
      }));
      setProductsList(productsFilteredList);
      const customersFetchData = await customersList();
      const customersFilteredList = customersFetchData.map(customer => ({
        key: customer.id,
        value: customer.name,
        text: customer.name,
        phone: customer.phone,
        email: customer.email,
      }));
      setCustomersList(customersFilteredList);
    };
    fetchData()

  }, []);

  return (
    <BudgetForm onSubmit={create} products={products} customers={customers} />
  )
};

export default CreateBudget;