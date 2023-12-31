"use client";
import { PageHeader, Loader } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { edit, useGetSupplier } from "@/api/suppliers";
import { useValidateToken } from "@/hooks/userData";
import { useAllowUpdate } from "@/hooks/allowUpdate";

const Supplier = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { supplier, isLoading } = useGetSupplier(params.id);
  const [allowUpdate, Toggle] = useAllowUpdate();

  if (!isLoading && !supplier) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <>
      <PageHeader title="Proveedor" />
      <Loader active={isLoading}>
        {Toggle}
        <SupplierForm supplier={supplier} onSubmit={edit} readonly={!allowUpdate} />
      </Loader>
    </>
  )
};

export default Supplier;
