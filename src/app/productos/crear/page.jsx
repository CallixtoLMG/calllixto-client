"use client";
import { useListBrands } from "@/api/brands";
import { create } from "@/api/products";
import { useListSuppliers } from "@/api/suppliers";
import { Loader, PageHeader } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const CreateProduct = () => {
  useValidateToken();
  const { push } = useRouter();
  const role = useRole();
  const { brands, isLoading: isLoadingBrands } = useListBrands();
  const { suppliers, isLoading: isLoadingSuppliers } = useListSuppliers();

  if (role === "user") {
    push(PAGES.NOT_FOUND.BASE)
  };

  const mappedBrands = useMemo(() => brands?.map(brand => ({
    ...brand,
    key: brand.id,
    value: brand.name,
    text: brand.name,
  })), [brands]);

  const mappedSuppliers = useMemo(() => suppliers?.map(supplier => ({
    ...supplier,
    key: supplier.id,
    value: supplier.name,
    text: supplier.name,
  })), [suppliers]);

  return (
    <>
      <PageHeader title="Crear Producto" />
      <Loader active={isLoadingBrands || isLoadingSuppliers}>
        <ProductForm brands={mappedBrands} suppliers={mappedSuppliers} onSubmit={create} />
      </Loader>
    </>
  )
};

export default CreateProduct;
