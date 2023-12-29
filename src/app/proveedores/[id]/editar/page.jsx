"use client";
import { edit, useGetSupplier } from "@/api/suppliers";
import { PageHeader, Loader } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { PAGES } from "@/constants";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";

const EditSupplier = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const role = useRole();
  const { supplier, isLoading } = useGetSupplier(params.id)

  if (!isLoading && !supplier || role === "user") {
    push(PAGES.NOT_FOUND.BASE);
    return;
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
