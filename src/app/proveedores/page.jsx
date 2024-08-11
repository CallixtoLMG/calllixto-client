"use client";
import { useUserContext } from "@/User";
import { deleteSupplier } from "@/api/suppliers";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { PAGES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useListAllSuppliers } from "../../api/suppliers";

const Suppliers = () => {
  useValidateToken();

  const { data, isLoading } = useListAllSuppliers();
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

  useKeyboardShortcuts(() => push(PAGES.SUPPLIERS.CREATE), SHORTKEYS.ENTER);

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
