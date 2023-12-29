"use client";
import { edit, getBrand } from "@/api/brands";
import { PageHeader, Loader } from "@/components/layout";
import BrandForm from "@/components/brands/BrandForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRole, useValidateToken } from "@/hooks/userData";

const EditBrand = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const role = useRole();
  const [brand, setBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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

  if (role === "user") {
    push(PAGES.NOT_FOUND.BASE);
  };

  return (
    <>
      <PageHeader title="Actualizar Marca" />
      <Loader active={isLoading}>
        {brand && <BrandForm brand={brand} onSubmit={edit} />}
      </Loader>
    </>
  )
};

export default EditBrand;

