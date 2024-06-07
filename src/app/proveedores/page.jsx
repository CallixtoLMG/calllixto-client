"use client";
import { useUserContext } from "@/User";
import { deleteSupplier, useListSuppliers } from "@/api/suppliers";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { ATTRIBUTES } from "@/components/suppliers/suppliers.common";
import { ENTITIES, PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { Rules } from "@/visibilityRules";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Suppliers = () => {
  useValidateToken();
  const { handleEntityChange } = usePaginationContext();

  useEffect(() => {
    handleEntityChange(ENTITIES.SUPPLIERS);
  }, []);

  const { data, isLoading, isRefetching } = useListSuppliers({ attributes: [ATTRIBUTES.ID, ATTRIBUTES.NAME, ATTRIBUTES.ADDRESS, ATTRIBUTES.PHONE, ATTRIBUTES.COMMENT] });
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  const { suppliers } = useMemo(() => {
    return { suppliers: data?.suppliers }
  }, [data]);

  useEffect(() => {
    setLabels([PAGES.SUPPLIERS.NAME]);
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
    <SuppliersPage
      isLoading={isLoading}
      isRefetching={isRefetching}
      suppliers={data?.suppliers}
      role={role}
      onDelete={deleteSupplier}
    />
  );
};

export default Suppliers;
