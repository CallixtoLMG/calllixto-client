"use client";
import { useUserContext } from "@/User";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { COLORS, ICONS, PAGES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { downloadExcel, formatedSimplePhone } from "@/utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useListSuppliers } from "../../api/suppliers";

const Suppliers = () => {
  useValidateToken();
  const { data, isLoading, isRefetching, refetch } = useListSuppliers();
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([PAGES.SUPPLIERS.NAME]);
  }, [setLabels]);

  const suppliers = useMemo(() => data?.suppliers, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  const prepareSupplierDataForExcel = useMemo(() => {
    if (!suppliers) return [];
    const headers = ["ID", 'Nombre', 'Dirección', 'Teléfono'];

    const supplierData = suppliers.map(supplier => [
      supplier.id,
      supplier.name,
      supplier.addresses?.map(address => `${address.ref ? `${address.ref}: ` : ''}${address.address}`).join(' , '),
      supplier.phoneNumbers?.map(phone => `${phone.ref ? `${phone.ref}: ` : ''}${formatedSimplePhone(phone)}`).join(' , ')
    ]);

    return [headers, ...supplierData];
  }, [suppliers]);


  useEffect(() => {

    const actions = RULES.canCreate[role] ? [
      {
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: () => { push(PAGES.SUPPLIERS.CREATE) },
        text: 'Crear'
      }
    ] : [];
    actions.push({
      id: 3,
      icon: ICONS.FILE_EXCEL,
      color: COLORS.SOFT_GREY,
      width: "fit-content",
      onClick: () => {
        downloadExcel(prepareSupplierDataForExcel, "Lista de Proveedores");
      },
      text: 'Proveedores',
      disabled: loading
    });

    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, role, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.SUPPLIERS.CREATE), SHORTKEYS.ENTER);

  return (
    <SuppliersPage
      onRefetch={refetch}
      isLoading={loading}
      suppliers={loading ? [] : suppliers}
      role={role}
    />
  );
};

export default Suppliers;
