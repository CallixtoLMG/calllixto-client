"use client";
import { PageHeader, Loader } from "@/components/layout";
import { useEffect, useState } from "react";
import BrandsPage from "@/components/brands/BrandsPage";
import { deleteBrand, list } from "@/api/brands";
import { useRole, useValidateToken } from "@/hooks/userData";

const Brands = () => {
  useValidateToken();
  const [isLoading, setIsLoading] = useState(true);
  const [brands, setBrands] = useState();
  const role = useRole();

  useEffect(() => {
    const fetchData = async () => {
      const brands = await list();
      setBrands(brands);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleDeleteBrand = async (id) => {
    await deleteBrand(id);
    setBrands(brands.filter(brand => brand.id !== id));
  };

  return (
    <>
      <PageHeader title={"Marcas"} />
      <Loader active={isLoading}>
        <BrandsPage
          brands={brands}
          role={role}
          isLoading={isLoading}
          onDelete={handleDeleteBrand}
        />
      </Loader>
    </>
  );
};

export default Brands;
