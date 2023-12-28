"use client";
import { create } from "@/api/products";
import { getUserData } from "@/api/userData";
import { PageHeader } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRole } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CreateProduct = () => {
  const { push } = useRouter();
  const role = useRole();

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
  }, [push]);
  if (role === "user") {
    push(PAGES.NOT_FOUND.BASE)
  };
  return (
    <>
      <PageHeader title="Crear Producto" />
      <ProductForm onSubmit={create} />
    </>
  )
};

export default CreateProduct;
