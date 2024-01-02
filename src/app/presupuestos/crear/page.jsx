"use client";
import { create } from "@/api/budgets";
import { useListCustomers } from "@/api/customers";
import { useListProducts } from "@/api/products";
import BudgetForm from "@/components/budgets/BudgetForm";
import { Loader, useBreadcrumContext } from "@/components/layout";
import { useUserData, useValidateToken } from "@/hooks/userData";
import { useEffect, useMemo } from "react";

const CreateBudget = () => {
  useValidateToken();
  const user = useUserData();
  const { products = [], isLoading: loadingProducts } = useListProducts();
  const { customers = [], isLoading: loadingCustomers } = useListCustomers();
  const { setLabels } = useBreadcrumContext();

  useEffect(() => {
    setLabels(['Presupuestos', 'Crear']);
  }, [setLabels]);

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
    <Loader active={loadingProducts || loadingCustomers}>
      <BudgetForm onSubmit={create} products={mappedProducts} customers={mappedCustomers} user={user} />
    </Loader>
  )
};

export default CreateBudget;
