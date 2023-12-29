"use client";
import { PageHeader, Loader } from "@/components/layout";
import { deleteSupplier, useListSuppliers } from "@/api/suppliers";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { useRole, useValidateToken } from "@/hooks/userData";

const Suppliers = () => {
  useValidateToken();
  const { suppliers, isLoading } = useListSuppliers();
  const role = useRole();

  return (
    <>
      <PageHeader title={"Proveedores"} />
      <Loader active={isLoading}>
        <SuppliersPage
          suppliers={suppliers}
          role={role}
          isLoading={isLoading}
          onDelete={deleteSupplier}
        />
      </Loader>
    </>
  );
};

export default Suppliers;
