"use client";
import { create, useGetBudget } from "@/api/budgets";
import { useListCustomers } from "@/api/customers";
import { useListProducts } from "@/api/products";
import BudgetForm from "@/components/budgets/BudgetForm";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useUserData, useValidateToken } from "@/hooks/userData";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

const CreateBudget = () => {
  useValidateToken();
  const user = useUserData();
  const searchParams = useSearchParams();
  const cloneId = searchParams.get('clonar');

  const { products = [], isLoading: loadingProducts } = useListProducts();
  const { customers = [], isLoading: loadingCustomers } = useListCustomers();
  const { budget, isLoading: loadingBudget } = useGetBudget(cloneId);

  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();

  useEffect(() => {
    resetActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <Loader active={loadingProducts || loadingCustomers || loadingBudget}>
      <BudgetForm onSubmit={create} products={mappedProducts} customers={mappedCustomers} user={user} budget={budget}/>
    </Loader>
  )
};

export default CreateBudget;
