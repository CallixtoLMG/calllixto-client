"use client";
import { useListBrands } from "@/api/brands";
import { create } from "@/api/products";
import { useListSuppliers } from "@/api/suppliers";
import { Loader, PageHeader } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";

const CreateProduct = () => {
  useValidateToken();
  const { push } = useRouter();
  const role = useRole();
  const { brands, isLoading: isLoadingBrands } = useListBrands();
  const { suppliers, isLoading: isLoadingSuppliers } = useListSuppliers();

  if (role === "user") {
    push(PAGES.NOT_FOUND.BASE)
  };

  return (
    <>
      <PageHeader title="Crear Producto" />
      <Loader active={isLoadingBrands || isLoadingSuppliers}>
        <ProductForm brands={brands} suppliers={suppliers} onSubmit={create} />
      </Loader>
    </>
  )
};

export default CreateProduct;
