"use client";
import { useUserContext } from "@/User";
import { deleteSupplier, useListSuppliers } from "@/api/suppliers";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { ATTRIBUTES } from "@/components/suppliers/suppliers.common";
import { ENTITIES, PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Suppliers = () => {
  useValidateToken();
  const { handleEntityChange } = usePaginationContext();

  useEffect(() => {
    handleEntityChange(ENTITIES.SUPPLIERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading } = useListSuppliers({ attributes: [ATTRIBUTES.ID, ATTRIBUTES.NAME, ATTRIBUTES.ADDRESSES, ATTRIBUTES.PHONES, ATTRIBUTES.COMMENT] });
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([PAGES.SUPPLIERS.NAME]);
  }, [setLabels]);

  useEffect(() => {
    const actions = RULES.canCreate[role] ? [
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
      suppliers={data?.suppliers}
      role={role}
      onDelete={deleteSupplier}
    />
  );
};

export default Suppliers;
