"use client"
import { getBrand } from "@/api/brands";
import { PageHeader, Loader } from "@/components/layout";
import ShowBrand from "@/components/brands/ShowBrand";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useValidateToken } from "@/hooks/userData";

const Brand = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [brand, setBrand] = useState({})
  const { push } = useRouter();
  const token = useValidateToken();

  useEffect(() => {
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
        const brand = await getBrand(params.id, requestOptions);

        if (!brand) {
          push(PAGES.NOT_FOUND.BASE);
          return;
        };
        setBrand(brand);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar marcas:', error);
      };
    };

    fetchBrand();
  }, [params.id, push, token]);

  return (
    <>
      <PageHeader title="Marca" />
      <Loader active={isLoading}>
        <ShowBrand brand={brand} />
      </Loader>
    </>
  )
};

export default Brand;
