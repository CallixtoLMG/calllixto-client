"use client";
import { create } from "@/api/products";
import { PageHeader } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";

const CreateProduct = () => {
  useValidateToken();
  const { push } = useRouter();
  const role = useRole();

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
