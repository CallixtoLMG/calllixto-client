"use client";
import { useUserContext } from "@/User";
import { fetchSuppliersForExport, usePagedSuppliers } from "@/api/suppliers";
import { useRefreshServerList } from "@/api/pagedLists";
import { COLORS, ENTITIES, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel, getFormatedPhone } from "@/common/utils";
import { useBreadcrumContext } from "@/components/layout";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { SUPPLIERS_FILTERS_KEY, SUPPLIER_SORT_FIELDS, SUPPLIER_STATES, EMPTY_FILTERS } from "@/components/suppliers/suppliers.constants";
import { useKeyboardShortcuts } from "@/hooks";
import useServerListFilters from "@/hooks/useServerListFilters";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const Suppliers = () => {
  const refreshList = useRefreshServerList(ENTITIES.SUPPLIERS);
  const list = useServerListFilters({
    key: SUPPLIERS_FILTERS_KEY, defaultFilters: EMPTY_FILTERS, sortFields: SUPPLIER_SORT_FIELDS, onApply: refreshList,
  });
  const { data, total, isFetching, error } = usePagedSuppliers(list);
  const [isExporting, setIsExporting] = useState(false);
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([{ name: PAGES.SUPPLIERS.NAME }]);
  }, [setLabels]);

  const { hydrated, pageNumber, pageSize, setPageNumber, appliedFilters, sort, order, refresh } = list;
  useEffect(() => {
    if (!hydrated || isFetching || total === null) return;
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    if (pageNumber > lastPage) setPageNumber(lastPage);
  }, [hydrated, isFetching, total, pageNumber, pageSize, setPageNumber]);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  const handleDownloadExcel = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const elements = await fetchSuppliersForExport({ appliedFilters, sort, order });
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
    } catch (error) {
      toast.error(error.message || "No se pudieron exportar los proveedores.");
    } finally {
      setIsExporting(false);
    }
  }, [appliedFilters, sort, order, isExporting]);

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
    actions.push({
      id: "update", icon: ICONS.REFRESH, color: COLORS.BLUE,
      text: "Actualizar proveedores", onClick: refresh, disabled: !hydrated || isFetching,
      showTooltipWhenExpanded: true,
    }, {
      id: "download-excel", icon: ICONS.FILE_EXCEL, color: COLORS.BLUE,
      text: "Descargar proveedores en Excel", onClick: handleDownloadExcel,
      disabled: !hydrated || isFetching || total === null || total === 0 || isExporting,
      loading: isExporting, showTooltipWhenExpanded: true,
    });
    return actions;
  }, [push, role, refresh, hydrated, isFetching, total, isExporting, handleDownloadExcel]);

  useKeyboardShortcuts(() => push(PAGES.SUPPLIERS.CREATE), SHORTKEYS.ENTER);

  return (
    <SuppliersPage
      isLoading={!hydrated || isFetching}
      suppliers={data?.items ?? []}
      list={list}
      total={total}
      sideActions={sideActions}
    />
  );
};

export default Suppliers;
