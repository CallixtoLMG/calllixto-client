"use client";
import { create } from "@/api/brands";
import { PageHeader } from "@/components/layout";
import BrandForm from "@/components/brands/BrandForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useRole, useValidateToken } from "@/hooks/userData";

const CreateBrand = () => {
  useValidateToken();
  const { push } = useRouter();
  const role = useRole();

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
