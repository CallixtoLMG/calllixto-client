"use client";
import { edit, getBrand } from "@/api/brands";
import { PageHeader, Loader } from "@/components/layout";
import BrandForm from "@/components/brands/BrandForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRole, useValidateToken } from "@/hooks/userData";

const EditBrand = ({ params }) => {
  const { push } = useRouter();
  const role = useRole();
  const [brand, setBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = useValidateToken();

  useEffect(() => {
    async function fetchBrand() {
      var requestOptions = {
        method: 'GET',
        redirect: 'follow',
        headers: {
          authorization: `Bearer ${token}`
        },
        cache: "no-store",
      };
      const data = await getBrand(params.id, requestOptions);
      if (!data) {
        push(PAGES.NOT_FOUND.BASE);
        return;
      };
      setBrand(data);
      setIsLoading(false);
    };

    fetchBrand();
  }, [params.id, push, token]);

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

