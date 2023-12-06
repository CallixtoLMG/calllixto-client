"use client";
import { create } from "@/api/budgets";
import { customersList } from "@/api/customers";
import { productsList } from "@/api/products";
import BudgetForm from "@/components/budgets/BudgetForm";
import Loader from "@/components/layout/Loader";
import { useEffect, useState } from "react";

const CreateBudget = () => {
  const [products, setProductsList] = useState(null);
  const [customers, setCustomersList] = useState(null);
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const requestOptions = {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: "no-store",
    };
    const fetchData = async () => {
      try {
        const productsFecthData = await productsList(requestOptions);
        const productsFilteredList = productsFecthData.map(product => ({
          price: product.price,
          key: product.code,
          code: product.code,
          value: product.name,
          text: product.name,
        }));
        setProductsList(productsFilteredList);
        setIsLoading(false)
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
      try {
        const customersFetchData = await customersList(requestOptions);
        const customersFilteredList = customersFetchData.map(customer => ({
          key: customer.name,
          value: customer.name,
          text: customer.name,
          phone: customer.phone,
          email: customer.email,
        }));
        setCustomersList(customersFilteredList);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      };
    };
    fetchData();
  }, []);
  return (
    <Loader active={isLoading}>
      <BudgetForm onSubmit={create} products={products} customers={customers} />
    </Loader>
  )
};

export default CreateBudget;
