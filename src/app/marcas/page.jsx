"use client";
import { Loader, useBreadcrumContext } from "@/components/layout";
import BrandsPage from "@/components/brands/BrandsPage";
import { deleteBrand, useListBrands } from "@/api/brands";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";

const Brands = () => {
  useValidateToken();
  const { brands, isLoading } = useListBrands();
  const role = useRole();
  const { setLabels } = useBreadcrumContext();

  useEffect(() => {
    setLabels(['Marcas']);
  }, [setLabels]);

  return (
    <Loader active={isLoading}>
      <BrandsPage
        brands={brands || []}
        role={role}
        isLoading={isLoading}
        onDelete={deleteBrand}
      />
    </Loader>
  );
};

export default Brands;
