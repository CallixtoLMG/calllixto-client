"use client";
import { useUserContext } from "@/User";
import { deleteSupplier, useListSuppliers } from "@/api/suppliers";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { Rules } from "@/visibilityRules";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Suppliers = () => {
  useValidateToken();
  const { data, isLoading, isRefetching } = useListSuppliers({ sort: 'name', order: false });
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels(['Proveedores']);
  }, [setLabels]);

  const { suppliers } = useMemo(() => {
    return { suppliers: data?.suppliers }
  }, [data]);

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
    <Loader active={isLoading || isRefetching}>
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
