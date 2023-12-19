"use client";
import { create } from "@/api/budgets";
import { customersList } from "@/api/customers";
import { productsList } from "@/api/products";
import { getUserData } from "@/api/userData";
import BudgetForm from "@/components/budgets/BudgetForm";
import { HeaderContainer } from "@/components/budgets/BudgetPage/styles";
import Loader from "@/components/layout/Loader";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CreateBudget = () => {
  const router = useRouter();
  const [products, setProductsList] = useState(null);
  const [customers, setCustomersList] = useState(null);
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
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
          router.push(PAGES.LOGIN.BASE)
        };
      } catch (error) {
        console.error('Error, ingreso no valido(token):', error);
      };
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
      };
    };
    validateToken();
    fetchData();
  }, [router]);
  return (
    <>
      <HeaderContainer>
        <PageHeader title="Crear presupuesto" />
      </HeaderContainer >
      <Loader active={isLoading}>
        <BudgetForm onSubmit={create} products={products} customers={customers} />
      </Loader>
    </>
  )
};

export default CreateBudget;
