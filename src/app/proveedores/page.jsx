"use client";
import { useBreadcrumContext, Loader } from "@/components/layout";
import { deleteSupplier, useListSuppliers } from "@/api/suppliers";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";

const Suppliers = () => {
  useValidateToken();
  const { suppliers, isLoading } = useListSuppliers();
  const role = useRole();
  const { setLabels } = useBreadcrumContext();

  useEffect(() => {
    setLabels(['Proveedores']);
  }, [setLabels]);

  return (
    <Loader active={isLoading}>
      <SuppliersPage
        suppliers={suppliers}
        role={role}
        isLoading={isLoading}
        onDelete={deleteSupplier}
      />
    </Loader>
  );
};

export default Suppliers;
