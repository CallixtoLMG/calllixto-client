"use client";
import { getUserData } from "@/api/userData";
import { PageHeader, Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandsPage from "@/components/brands/BrandsPage";
import { brandsList, deleteBrand } from "@/api/brands";
import { useRole } from "@/hooks/userData";

const Brands = () => {
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [brands, setBrands] = useState();
  const role = useRole();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      push(PAGES.LOGIN.BASE);
    };

    const requestOptions = {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    };

    const validateToken = async () => {
      try {
        const userData = await getUserData();
        if (!userData.isAuthorized) {
          push(PAGES.LOGIN.BASE);
        };
      } catch (error) {
        console.error('Error, ingreso no valido(token):', error);
      };
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

    validateToken();
    fetchBrands();
  }, [push]);

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
