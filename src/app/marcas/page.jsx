"use client";
import { PageHeader, Loader } from "@/components/layout";
import BrandsPage from "@/components/brands/BrandsPage";
import { deleteBrand, useListBrands } from "@/api/brands";
import { useRole, useValidateToken } from "@/hooks/userData";

const Brands = () => {
  useValidateToken();
  const { brands, isLoading } = useListBrands();
  const role = useRole();

  return (
    <>
      <PageHeader title={"Marcas"} />
      <Loader active={isLoading}>
        <BrandsPage
          brands={brands || []}
          role={role}
          isLoading={isLoading}
          onDelete={deleteBrand}
        />
      </Loader>
    </>
  );
};

export default Brands;
