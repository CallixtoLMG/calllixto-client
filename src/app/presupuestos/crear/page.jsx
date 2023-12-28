"use client";
import { create, getBudget } from "@/api/budgets";
import { customersList } from "@/api/customers";
import { productsList } from "@/api/products";
import BudgetForm from "@/components/budgets/BudgetForm";
import { PageHeader, Loader } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const CreateBudget = () => {
  const { push } = useRouter();
  const [products, setProductsList] = useState(null);
  const [customers, setCustomersList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cloneBudget, setCloneBudget] = useState(null);

  const searchParams = useSearchParams();
  const cloneId = useMemo(() => searchParams.get('clonar'), [searchParams]);
  const token = useValidateToken();

  useEffect(() => {
    const requestOptions = {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: "no-store",
    };

    const fetchData = async () => {
      if (cloneId) {
        try {
          const budget = await getBudget(cloneId, requestOptions);
          setCloneBudget(budget);
        } catch (error) {
          console.error('Error al cargar presupuesto para clonar:', error);
        }
      }

      try {
        const productsFecthData = await productsList(requestOptions);
        const productsFilteredList = productsFecthData.map(product => ({
          ...product,
          key: product.code,
          value: product.name,
          text: product.name,
        }));
        setProductsList(productsFilteredList);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }

      try {
        const customersFetchData = await customersList(requestOptions);
        const customersFilteredList = customersFetchData.map(customer => ({
          key: customer.name,
          id: customer.id,
          value: customer.name,
          text: customer.name,
          phone: customer.phone,
          email: customer.email,
        }));
        setCustomersList(customersFilteredList);
      } catch (error) {
        console.error('Error al crear clientes:', error);
      } finally {
        setIsLoading(false);
      };
    };

    fetchData();
  }, [cloneId, push, token]);

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
