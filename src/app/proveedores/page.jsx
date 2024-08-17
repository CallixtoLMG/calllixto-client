"use client";
import { useUserContext } from "@/User";
import { LIST_SUPPLIERS_QUERY_KEY } from "@/api/suppliers";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { ENTITIES, PAGES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useListAllSuppliers } from "../../api/suppliers";
import { useRestoreEntity } from "@/hooks/common";

const Suppliers = () => {
  useValidateToken();
  const { data, isLoading, isRefetching } = useListAllSuppliers();
  const restoreEntity = useRestoreEntity({ entity: ENTITIES.SUPPLIERS, key: LIST_SUPPLIERS_QUERY_KEY });
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([PAGES.SUPPLIERS.NAME]);
  }, [setLabels]);

  const suppliers = useMemo(() => data?.suppliers, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  useEffect(() => {
    const handleRestore = async () => {
      await restoreEntity();
    };

    const actions = RULES.canCreate[role] ? [
      {
        id: 1,
        icon: 'add',
        color: 'green',
        onClick: () => { push(PAGES.SUPPLIERS.CREATE) },
        text: 'Crear'
      }
    ] : [];
    actions.push({
      id: 2,
      icon: 'undo',
      color: 'grey',
      onClick: handleRestore,
      text: 'Actualizar',
      disabled: loading
    });
    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, role, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.SUPPLIERS.CREATE), SHORTKEYS.ENTER);

  return (
    <SuppliersPage
      isLoading={loading}
      suppliers={loading ? [] : suppliers}
      role={role}
    />
  );
};

export default Suppliers;
