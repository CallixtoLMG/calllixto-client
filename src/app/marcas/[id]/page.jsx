"use client"
import { getBrand } from "@/api/brands";
import { getUserData } from "@/api/userData";
import { PageHeader, Loader } from "@/components/layout";
import ShowBRAND from "@/components/brands/ShowBrand";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Brand = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [brand, setBrand] = useState({})
  const { push } = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      push(PAGES.LOGIN.BASE);
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

    const fetchBrand = async () => {
      try {
        const requestOptions = {
          method: 'GET',
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: "no-store",
        };
        const brand = await getBrand(params.code, requestOptions);

        if (!brand) {
          push(PAGES.NOTFOUND.BASE);
          return;
        };
        setBrand(brand);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar marcas:', error);
      };
    };

    validateToken()
    fetchBrand();
  }, [params.code, push]);

  return (
    <>
      <PageHeader title="Marca" />
      <Loader active={isLoading}>
        <ShowBRAND brand={brand} />
      </Loader>
    </>
  )
};

export default Brand;
