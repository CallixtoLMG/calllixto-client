"use client";
import { fetchCustomersForExport, usePagedCustomers } from "@/api/customers";
import { useRefreshServerList } from "@/api/pagedLists";
import { COLORS, ENTITIES, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel, getFormatedPhone } from "@/common/utils";
import CustomersPage from "@/components/customers/CustomersPage";
import { CUSTOMERS_FILTERS_KEY, CUSTOMER_SORT_FIELDS, CUSTOMER_STATES, EMPTY_FILTERS } from "@/components/customers/customers.constants";
import { useBreadcrumContext } from "@/components/layout";
import { useKeyboardShortcuts } from "@/hooks";
import useServerListFilters from "@/hooks/useServerListFilters";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const Customers = () => {
  const refreshList = useRefreshServerList(ENTITIES.CUSTOMERS);
  const list = useServerListFilters({
    key: CUSTOMERS_FILTERS_KEY, defaultFilters: EMPTY_FILTERS, sortFields: CUSTOMER_SORT_FIELDS, onApply: refreshList,
  });
  const { data, total, isFetching, error } = usePagedCustomers(list);
  const [isExporting, setIsExporting] = useState(false);
  const { setLabels } = useBreadcrumContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([{ name: PAGES.CUSTOMERS.NAME }]);
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
      const elements = await fetchCustomersForExport({ appliedFilters, sort, order });
      if (!elements.length) return;
      const headers = ['Nombre', 'Estado', 'Dirección', 'Teléfono'];
      const mappedCustomers = elements.map(customer => {
        const customerState = CUSTOMER_STATES[customer.state]?.singularTitle || customer.state;
        return [
          customer.name,
          customerState,
          customer.addresses?.map(address => `${address.ref ? `${address.ref}: ` : ''}${address.address}`).join(' , '),
          customer.phoneNumbers?.map(phone => `${phone.ref ? `${phone.ref}: ` : ''}${getFormatedPhone(phone)}`).join(' , ')
        ];
      });
      downloadExcel([headers, ...mappedCustomers], "Lista de Clientes");
    } catch (error) {
      toast.error(error.message || "No se pudieron exportar los clientes.");
    } finally {
      setIsExporting(false);
    }
  }, [appliedFilters, sort, order, isExporting]);

  const sideActions = useMemo(() => [
      {
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: () => { push(PAGES.CUSTOMERS.CREATE) },
        text: 'Crear cliente',
      },
      {
        id: "update", icon: ICONS.REFRESH, color: COLORS.BLUE,
        text: "Actualizar clientes", onClick: refresh, disabled: !hydrated || isFetching,
      },
      {
        id: "download-excel", icon: ICONS.FILE_EXCEL, color: COLORS.BLUE,
        text: "Descargar clientes en Excel", onClick: handleDownloadExcel,
        disabled: !hydrated || isFetching || total === null || total === 0 || isExporting,
        loading: isExporting, showTooltipWhenExpanded: true,
      }
    ], [push, refresh, hydrated, isFetching, total, isExporting, handleDownloadExcel]);

  useKeyboardShortcuts(() => push(PAGES.CUSTOMERS.CREATE), SHORTKEYS.ENTER);

  return (
    <CustomersPage
      isLoading={!hydrated || isFetching}
      customers={data?.items ?? []}
      list={list}
      total={total}
      sideActions={sideActions}
    />
  );
};

export default Customers;
