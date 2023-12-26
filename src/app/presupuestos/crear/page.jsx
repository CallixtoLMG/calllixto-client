"use client";
import { create, getBudget } from "@/api/budgets";
import { customersList } from "@/api/customers";
import { productsList } from "@/api/products";
import { getUserData } from "@/api/userData";
import BudgetForm from "@/components/budgets/BudgetForm";
import { PageHeader, Loader } from "@/components/layout";
import { PAGES } from "@/constants";
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      push(PAGES.LOGIN.BASE)
    };
    const requestOptions = {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: "no-store",
    };
    const validateToken = async () => {
      try {
        const userData = await getUserData();
        if (!userData.isAuthorized) {
          push(PAGES.LOGIN.BASE)
        };
      } catch (error) {
        console.error('Error, ingreso no valido(token):', error);
      };
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
          price: product.price,
          key: product.code,
          code: product.code,
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
    validateToken();
    fetchData();
  }, [cloneId, push]);
  return (
    <>
      <PageHeader title="Crear presupuesto" />
      <Loader active={isLoading}>
        <BudgetForm onSubmit={create} products={products} customers={customers} budget={cloneBudget} />
      </Loader>
    </>
  )
};

export default CreateBudget;
