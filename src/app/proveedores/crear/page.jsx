"use client";
import { create } from "@/api/suppliers";
import { getUserData } from "@/api/userData";
import { PageHeader } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRole } from "@/hooks/userData";

const CreateSupplier = () => {
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
    push(PAGES.NOT_FOUND.BASE);
  };

  return (
    <>
      <PageHeader title="Crear Proveedor" />
      <SupplierForm onSubmit={create} />
    </>
  )
};

export default CreateSupplier;
