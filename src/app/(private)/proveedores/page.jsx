"use client";
import { readListPagination } from "@/api/listPagination";
import { useUserContext } from "@/User";
import { useListSuppliers } from "@/api/suppliers";
import { COLORS, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel, getFormatedPhone } from "@/common/utils";
import { useBreadcrumContext } from "@/components/layout";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { EMPTY_FILTERS, SUPPLIERS_FILTERS_KEY, SUPPLIER_STATES } from "@/components/suppliers/suppliers.constants";
import { useFilters, useKeyboardShortcuts } from "@/hooks";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

const Suppliers = () => {
  const filterControls = useFilters({
    defaultFilters: EMPTY_FILTERS,
    key: SUPPLIERS_FILTERS_KEY,
    remoteEntity: "suppliers",
  });
  const { data, isLoading, isRefetching, refetch } = useListSuppliers({ ...filterControls.listRequest, enabled: filterControls.hydrated });
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([{ name: PAGES.SUPPLIERS.NAME }]);
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

  const sideActions = useMemo(() => {
    const actions = [];
    if (RULES.canCreate[role]) {
      actions.push({
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: () => { push(PAGES.SUPPLIERS.CREATE) },
        text: 'Crear proveedor',
      })
    }
    return actions;
  }, [push, role]);

  useKeyboardShortcuts(() => push(PAGES.SUPPLIERS.CREATE), SHORTKEYS.ENTER);

  return (
    <SuppliersPage
      filterControls={filterControls}
      serverPagination={{ ...filterControls.listRequest, ...readListPagination(data) }}
      onRefetch={refetch}
      isLoading={loading}
      suppliers={loading ? [] : suppliers}
      onDownloadExcel={handleDownloadExcel}
      sideActions={sideActions}
    />
  );
};

export default Suppliers;
