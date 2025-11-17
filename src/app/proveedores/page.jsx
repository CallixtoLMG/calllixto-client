"use client";
import { useUserContext } from "@/User";
import { useListSuppliers } from "@/api/suppliers";
import { COLORS, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel, getFormatedPhone } from "@/common/utils";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { SUPPLIER_STATES } from "@/components/suppliers/suppliers.constants";
import { useKeyboardShortcuts, useValidateToken } from "@/hooks";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

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

  const handleDownloadExcel = useCallback((elements) => {
    if (!elements.length) return;
    const headers = ["Id", 'Nombre', 'Estado', 'Dirección', 'Teléfono'];
    const mappedSuppliers = elements.map(supplier => {
      const supplierState = SUPPLIER_STATES[supplier.state]?.singularTitle || supplier.state;
      return [
        supplier.id,
        supplier.name,
        supplierState,
        supplier.addresses?.map(address => `${address.ref ? `${address.ref}: ` : ''}${address.address}`).join(' , '),
        supplier.phoneNumbers?.map(phone => `${phone.ref ? `${phone.ref}: ` : ''}${getFormatedPhone(phone)}`).join(' , ')
      ];
    });
    downloadExcel([headers, ...mappedSuppliers], "Lista de Proveedores");
  }, []);

  useEffect(() => {
    const actions = [];
    if (RULES.canCreate[role]) {
      actions.push({
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: () => { push(PAGES.SUPPLIERS.CREATE) },
        text: 'Crear'
      })
    }
    setActions(actions);
  }, [push, role, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.SUPPLIERS.CREATE), SHORTKEYS.ENTER);

  return (
    <SuppliersPage
      onRefetch={refetch}
      isLoading={loading}
      suppliers={loading ? [] : suppliers}
      onDownloadExcel={handleDownloadExcel}
    />
  );
};

export default Suppliers;
