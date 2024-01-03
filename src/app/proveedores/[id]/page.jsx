"use client";
import { useBreadcrumContext, Loader, useNavActionsContext } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { edit, useGetSupplier } from "@/api/suppliers";
import { useValidateToken } from "@/hooks/userData";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useEffect } from "react";

const Supplier = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { supplier, isLoading } = useGetSupplier(params.id);
  const [allowUpdate, Toggle] = useAllowUpdate();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();

  useEffect(() => {
    resetActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Proveedores', supplier?.name]);
  }, [setLabels, supplier]);

  if (!isLoading && !supplier) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <Loader active={isLoading}>
      {Toggle}
      <SupplierForm supplier={supplier} onSubmit={edit} readonly={!allowUpdate} />
    </Loader>
  )
};

export default Supplier;
