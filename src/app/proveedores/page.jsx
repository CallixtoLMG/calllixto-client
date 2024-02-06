"use client";
import { useBreadcrumContext, Loader, useNavActionsContext } from "@/components/layout";
import { deleteSupplier, useListSuppliers } from "@/api/suppliers";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PAGES } from "@/constants";
import { Rules } from "@/visibilityRules";
import { useUserContext } from "@/User";

const Suppliers = () => {
  useValidateToken();
  const { suppliers, isLoading } = useListSuppliers();
  const { role } = useUserContext();
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
