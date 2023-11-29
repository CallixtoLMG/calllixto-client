"use client";
import { create } from "@/api/budgets";
import { customersList } from "@/api/customers";
import { productsList } from "@/api/products";
import BudgetForm from "@/components/budgets/BudgetForm";
import { useEffect, useState } from "react";

const CreateBudget = () => {
  const [products, setProductsList] = useState(null);
  const [customers, setCustomersList] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchData = async () => {
      try {
        const requestOptions = {
          method: 'GET',
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: "no-store",
        };
        const productsFecthData = await productsList(requestOptions);
        const productsFilteredList = productsFecthData.map(product => ({
          price: product.price,
          key: product.code,
          code: product.code,
          value: product.name,
          text: product.name,
        }));
        setProductsList(productsFilteredList);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
      try {
        const requestOptions = {
          method: 'GET',
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: "no-store",
        };
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
    <BudgetForm onSubmit={create} products={products} customers={customers} />
  )
};

export default CreateBudget;