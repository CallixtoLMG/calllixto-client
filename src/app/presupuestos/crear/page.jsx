"use client";
import { create } from "@/apiCalls/budgets";
import { loadCustomers } from "@/apiCalls/customers";
import { loadProducts } from "@/apiCalls/products";
import BudgetForm from "@/components/budgets/BudgetForm";
import { useEffect, useState } from "react";

const CreateBudget = () => {

  const [productsList, setProductsList] = useState(null)
  const [customersList, setCustomersList] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const productsData = await loadProducts();
      const productsList = productsData.map(product => ({
        price: product.price,
        key: product.code,
        code: product.code,
        value: product.name,
        text: product.name,
      }));
      setProductsList(productsList);
      const customersData = await loadCustomers();
      const customersList = customersData.map(customer => ({
        key: customer.id,
        value: customer.name,
        text: customer.name,
        phone: customer.phone,
        email: customer.email,
      }));
      setCustomersList(customersList);
    };
    fetchData()

  }, []);

  return (
    <BudgetForm onSubmit={create} products={productsList} customers={customersList} />
  )
};

export default CreateBudget;