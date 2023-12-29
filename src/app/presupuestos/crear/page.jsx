"use client";
import { create } from "@/api/budgets";
import { useListCustomers } from "@/api/customers";
import { useListProducts } from "@/api/products";
import BudgetForm from "@/components/budgets/BudgetForm";
import { PageHeader, Loader } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";
import { useMemo } from "react";

const CreateBudget = () => {
  useValidateToken();
  const { products = [], isLoading: loadingProducts } = useListProducts();
  const { customers = [], isLoading: loadingCustomers } = useListCustomers();

  const mappedProducts = useMemo(() => products.map(product => ({
    ...product,
    key: product.code,
    value: product.name,
    text: product.name,
  })), [products]);

  const mappedCustomers = useMemo(() => customers.map(customer => ({
    ...customer,
    key: customer.name,
    value: customer.name,
    text: customer.name,
  })), [customers]);

  return (
    <>
      <PageHeader title="Crear Presupuesto" />
      <Loader active={loadingProducts || loadingCustomers}>
        <BudgetForm onSubmit={create} products={mappedProducts} customers={mappedCustomers} />
      </Loader>
    </>
  )
};

export default CreateBudget;
