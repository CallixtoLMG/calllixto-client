"use client";
import { create } from "@/api/brands";
import { useBreadcrumContext } from "@/components/layout";
import BrandForm from "@/components/brands/BrandForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";

const CreateBrand = () => {
  useValidateToken();
  const { push } = useRouter();
  const role = useRole();
  const { setLabels } = useBreadcrumContext();

  useEffect(() => {
    setLabels(['Marcas', 'Crear']);
  }, [setLabels]);

  if (role === "user") {
    push(PAGES.NOT_FOUND.BASE);
  };

  return (
    <BrandForm onSubmit={create} />
  )
};

export default CreateBrand;
