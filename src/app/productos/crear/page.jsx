"use client";
import { useListBrands } from "@/api/brands";
import { create } from "@/api/products";
import { useListSuppliers } from "@/api/suppliers";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { useValidateToken } from "@/hooks/userData";
import { useEffect, useMemo } from "react";

const CreateProduct = () => {
  useValidateToken();
  const { brands, isLoading: isLoadingBrands } = useListBrands();
  const { suppliers, isLoading: isLoadingSuppliers } = useListSuppliers();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Productos', 'Crear']);
  }, [setLabels]);

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
    <Loader active={isLoadingBrands || isLoadingSuppliers}>
      <ProductForm brands={mappedBrands} suppliers={mappedSuppliers} onSubmit={create} />
    </Loader>
  )
};

export default CreateProduct;
