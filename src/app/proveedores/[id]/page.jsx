"use client";
import { PageHeader, Loader } from "@/components/layout";
import ShowSupplier from "@/components/suppliers/ShowSupplier";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupplier } from "@/api/suppliers";
import { useValidateToken } from "@/hooks/userData";

const Supplier = ({ params }) => {
  useValidateToken();
  const [isLoading, setIsLoading] = useState(true)
  const [supplier, setSupplier] = useState({})
  const { push } = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const supplier = await getSupplier(params.id);

      if (!supplier) {
        push(PAGES.NOT_FOUND.BASE);
        return;
      };

      setSupplier(supplier);
      setIsLoading(false);
    };

    fetchData();
  }, [params.id, push]);

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
