"use client";
import { create } from "@/api/suppliers";
import { PageHeader } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useRole, useValidateToken } from "@/hooks/userData";

const CreateSupplier = () => {
  useValidateToken();
  const { push } = useRouter();
  const role = useRole();

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
