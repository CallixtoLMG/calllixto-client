"use client"
import { create } from "@/api/products";
import { getUserData } from "@/api/userData";
import { PageHeader } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CreateProduct = () => {
  const { push } = useRouter();
  const [role, setRole] = useState();
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
  }, [push]);
  if (role === "user") {
    push(PAGES.NOTFOUND.BASE)
  };
  return (
    <>
      <PageHeader title="Crear Producto" />
      <ProductForm onSubmit={create} />
    </>
  )
};

export default CreateProduct;
