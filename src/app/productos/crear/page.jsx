"use client"
import { create } from "@/api/products";
import { getUserData } from "@/api/userData";
import { HeaderContainer } from "@/components/customers/CustomersPage/styles";
import PageHeader from "@/components/layout/PageHeader";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CreateProduct = () => {
  const router = useRouter();
  const [role, setRole] = useState();
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
    const fetchRol = async () => {
      try {
        const userData = await getUserData();
        setRole(userData.roles[0]);
      } catch (error) {
        console.error('Error, rol no valido:', error);
      };
    };
    validateToken();
    fetchRol();
  }, [router]);
  if (role === "user") {
    router.push(PAGES.NOTFOUND.BASE)
  };
  return (
    <>
      <HeaderContainer>
        <PageHeader title="Crear Producto" />
      </HeaderContainer>
      <ProductForm onSubmit={create} />
    </>
  )
};

export default CreateProduct;
