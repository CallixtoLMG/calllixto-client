"use client"
import { create } from "@/api/customers";
import { getUserData } from "@/api/userData";
import CustomerForm from "@/components/customers/CustomerForm";
import { PageHeader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CreateCustomer = () => {
  const { push } = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      push(PAGES.LOGIN.BASE);
    };
    const validateToken = async () => {
      try {
        const userData = await getUserData();
        if (!userData.isAuthorized) {
          push(PAGES.LOGIN.BASE);
        };
      } catch (error) {
        console.error('Error, ingreso no valido(token):', error);
      };
    };
    validateToken();
  }, []);
  return (
    <>
      <PageHeader title="Crear Cliente" />
      <CustomerForm onSubmit={create} />
    </>
  )
};

export default CreateCustomer;