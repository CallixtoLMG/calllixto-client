"use client";
import { edit, getSupplier } from "@/api/suppliers";
import { PageHeader, Loader } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { PAGES } from "@/constants";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditSupplier = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const role = useRole();
  const [supplier, setSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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

  if (role === "user") {
    push(PAGES.NOT_FOUND.BASE);
  };

  return (
    <>
      <PageHeader title="Actualizar Proveedor" />
      <Loader active={isLoading}>
        {supplier && <SupplierForm supplier={supplier} onSubmit={edit} />}
      </Loader>
    </>
  )
};

export default EditSupplier;
