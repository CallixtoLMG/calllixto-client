"use client";
import { deleteSupplier, useListSuppliers } from "@/api/suppliers";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { PAGES } from "@/constants";
import { useRole, useValidateToken } from "@/hooks/userData";
import { Rules } from "@/visibilityRules";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Suppliers = () => {
  useValidateToken();
  const { suppliers, isLoading } = useListSuppliers();
  const role = useRole();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels(['Proveedores']);
  }, [setLabels]);

  useEffect(() => {
    const visibilityRules = Rules(role);
    const actions = visibilityRules.canSeeButtons ? [
      {
        id: 1,
        icon: 'add',
        color: 'green',
        onClick: () => { push(PAGES.SUPPLIERS.CREATE) },
        text: 'Crear'
      }
    ] : [];
    setActions(actions);
  }, [push, role, setActions]);

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
