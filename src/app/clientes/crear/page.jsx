"use client"
import { create } from "@/api/customers";
import { getUserData } from "@/api/userData";
import CustomerForm from "@/components/customers/CustomerForm";
import { HeaderContainer } from "@/components/customers/CustomersPage/styles";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CreateCustomer = () => {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
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
    validateToken();
  }, [router]);
  return (
    <>
      <HeaderContainer>
        <PageHeader title="Crear Cliente" />
      </HeaderContainer >
      <CustomerForm onSubmit={create} />
    </>
  )
};

export default CreateCustomer;