"use client";
import { getUserData } from "@/api/userData";
import { PageHeader, Loader } from "@/components/layout";
import ShowSupplier from "@/components/suppliers/ShowSupplier";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupplier } from "@/api/suppliers";
import { useValidateToken } from "@/hooks/userData";

const Supplier = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [supplier, setSupplier] = useState({})
  const { push } = useRouter();
  const token = useValidateToken();

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const requestOptions = {
          method: 'GET',
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: "no-store",
        };
        const supplier = await getSupplier(params.id, requestOptions);

        if (!supplier) {
          push(PAGES.NOT_FOUND.BASE);
          return;
        };
        setSupplier(supplier);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar marcas:', error);
      };
    };

    fetchSupplier();
  }, [params.id, push, token]);

  return (
    <>
      <PageHeader title="Proveedor" />
      <Loader active={isLoading}>
        <ShowSupplier supplier={supplier} />
      </Loader>
    </>
  )
};

export default Supplier;
