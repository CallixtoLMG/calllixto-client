"use client";
import { create } from "@/api/suppliers";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";

const CreateSupplier = () => {
  useValidateToken();
  const { push } = useRouter();
  const role = useRole();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();

  useEffect(() => {
    resetActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Proveedores', 'Crear']);
  }, [setLabels]);

  if (role === "user") {
    push(PAGES.NOT_FOUND.BASE);
  };

  return (
    <SupplierForm onSubmit={create} />
  )
};

export default CreateSupplier;
