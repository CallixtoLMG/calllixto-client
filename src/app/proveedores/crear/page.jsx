"use client";
import { create } from "@/api/suppliers";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";

const CreateSupplier = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Proveedores', 'Crear']);
  }, [setLabels]);

  return (
    <SupplierForm onSubmit={create} />
  )
};

export default CreateSupplier;
