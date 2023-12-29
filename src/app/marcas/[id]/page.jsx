"use client"
import { getBrand } from "@/api/brands";
import { PageHeader, Loader } from "@/components/layout";
import ShowBrand from "@/components/brands/ShowBrand";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useValidateToken } from "@/hooks/userData";

const Brand = ({ params }) => {
  useValidateToken();
  const [isLoading, setIsLoading] = useState(true)
  const [brand, setBrand] = useState({})
  const { push } = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const brand = await getBrand(params.id);

      if (!brand) {
        push(PAGES.NOT_FOUND.BASE);
        return;
      };

      setBrand(brand);
      setIsLoading(false);
    };

    fetchData();
  }, [params.id, push]);

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
