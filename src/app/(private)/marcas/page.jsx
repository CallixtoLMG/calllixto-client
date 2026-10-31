"use client";
import { useUserContext } from "@/User";
import { fetchBrandsForExport, usePagedBrands } from "@/api/brands";
import { useRefreshServerList } from "@/api/pagedLists";
import { COLORS, ENTITIES, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel } from "@/common/utils";
import BrandsPage from "@/components/brands/BrandsPage";
import { BRANDS_FILTERS_KEY, BRAND_SORT_FIELDS, BRAND_STATES, EMPTY_FILTERS } from "@/components/brands/brands.constants";
import { useBreadcrumContext } from "@/components/layout";
import { useKeyboardShortcuts } from "@/hooks";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import useServerListFilters from "@/hooks/useServerListFilters";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const Brands = () => {
  const refreshList = useRefreshServerList(ENTITIES.BRANDS);
  const list = useServerListFilters({
    key: BRANDS_FILTERS_KEY, defaultFilters: EMPTY_FILTERS, sortFields: BRAND_SORT_FIELDS, onApply: refreshList,
  });
  const { data, total, isFetching, error } = usePagedBrands(list);
  const [isExporting, setIsExporting] = useState(false);
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([{ name: PAGES.BRANDS.NAME }]);
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
      const elements = await fetchBrandsForExport({ appliedFilters, sort, order });
      if (!elements.length) return;
      const headers = ['Id', 'Nombre', 'Estado', 'Comentarios'];
      const mappedBrands = elements.map(brand => {
        const brandState = BRAND_STATES[brand.state]?.singularTitle || brand.state;
        return [
          brand.id,
          brand.name,
          brandState,
          brand.comments,
        ];
      });
      downloadExcel([headers, ...mappedBrands], "Lista de Marcas");
    } catch (error) {
      toast.error(error.message || "No se pudieron exportar las marcas.");
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
        onClick: () => { push(PAGES.BRANDS.CREATE) },
        text: 'Crear marca',
      })
    }

    actions.push({
      id: "update", icon: ICONS.REFRESH, color: COLORS.BLUE,
      text: "Actualizar marcas", onClick: refresh, disabled: !hydrated || isFetching,
    }, {
      id: "download-excel", icon: ICONS.FILE_EXCEL, color: COLORS.BLUE,
      text: "Descargar marcas en Excel", onClick: handleDownloadExcel,
      disabled: !hydrated || isFetching || total === null || total === 0 || isExporting,
      loading: isExporting, showTooltipWhenExpanded: true,
    });
    return actions;
  }, [push, role, refresh, hydrated, isFetching, total, isExporting, handleDownloadExcel]);

  useKeyboardShortcuts(() => push(PAGES.BRANDS.CREATE), SHORTKEYS.ENTER);

  return (
    <BrandsPage
      isLoading={!hydrated || isFetching}
      brands={data?.items ?? []}
      list={list}
      total={total}
      sideActions={sideActions}
    />
  );
};

export default Brands;
