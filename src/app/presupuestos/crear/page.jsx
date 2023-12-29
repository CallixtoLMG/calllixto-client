"use client";
import { create } from "@/api/budgets";
import { list as customersList } from "@/api/customers";
import { list as productsList } from "@/api/products";
import BudgetForm from "@/components/budgets/BudgetForm";
import { PageHeader, Loader } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CreateBudget = () => {
  useValidateToken();
  const { push } = useRouter();
  const [products, setProductsList] = useState(null);
  const [customers, setCustomersList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const products = await productsList();
      const mappedProducts = products.map(product => ({
        ...product,
        key: product.code,
        value: product.name,
        text: product.name,
      }));
      setProductsList(mappedProducts);

      const customers = await customersList();
      const mappedCustomers = customers.map(customer => ({
        ...customer,
        key: customer.name,
        value: customer.name,
        text: customer.name,
      }));
      setCustomersList(mappedCustomers);

      setIsLoading(false);
    };

    fetchData();
  }, [push]);

  return (
    <>
      <PageHeader title="Crear Presupuesto" />
      <Loader active={isLoading}>
        <BudgetForm onSubmit={create} products={products} customers={customers} budget={cloneBudget} />
      </Loader>
    </>
  )
};

export default CreateBudget;
