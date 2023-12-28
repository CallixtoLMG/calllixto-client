"use client";
import { PageHeader, Loader } from "@/components/layout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandsPage from "@/components/brands/BrandsPage";
import { brandsList, deleteBrand } from "@/api/brands";
import { useRole, useValidateToken } from "@/hooks/userData";

const Brands = () => {
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [brands, setBrands] = useState();
  const role = useRole();
  const token = useValidateToken();

  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    };

    const fetchBrands = async () => {
      try {
        const brands = await brandsList(requestOptions);
        setBrands(brands);
      } catch (error) {
        console.error("Error al cargar marcas:", error);
      } finally {
        setIsLoading(false);
      };
    };

    fetchBrands();
  }, [push, token]);

  const handleDeleteBrand = async (id) => {
    try {
      await deleteBrand(id);
      const updatedBrands = brands.filter(brand => brand.id !== id);
      setBrands(updatedBrands);
    } catch (error) {
      console.error('Error borrando marca', error);
    };
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
