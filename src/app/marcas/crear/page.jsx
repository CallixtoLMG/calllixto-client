"use client";
import { create } from "@/api/brands";
import { getUserData } from "@/api/userData";
import { PageHeader } from "@/components/layout";
import BrandForm from "@/components/brands/BrandForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRole } from "@/hooks/userData";

const CreateBrand = () => {
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
      <PageHeader title="Crear Marca" />
      <BrandForm onSubmit={create} />
    </>
  )
};

export default CreateBrand;
