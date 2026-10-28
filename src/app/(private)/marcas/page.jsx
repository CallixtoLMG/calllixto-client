"use client";
import { readListPagination } from "@/api/listPagination";
import { useUserContext } from "@/User";
import { useListBrands } from "@/api/brands";
import { COLORS, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel } from "@/common/utils";
import BrandsPage from "@/components/brands/BrandsPage";
import { EMPTY_FILTERS, BRANDS_FILTERS_KEY, BRAND_STATES } from "@/components/brands/brands.constants";
import { useBreadcrumContext } from "@/components/layout";
import { useFilters, useKeyboardShortcuts } from "@/hooks";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

const Brands = () => {
  const filterControls = useFilters({
    defaultFilters: EMPTY_FILTERS,
    key: BRANDS_FILTERS_KEY,
    remoteEntity: "brands",
  });
  const { data, isLoading, isRefetching, refetch } = useListBrands({ ...filterControls.listRequest, enabled: filterControls.hydrated });
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([{ name: PAGES.BRANDS.NAME }]);
  }, [setLabels]);

  const brands = useMemo(() => data?.brands, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  const handleDownloadExcel = useCallback((elements) => {
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
  }, []);

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

    return actions;
  }, [push, role]);

  useKeyboardShortcuts(() => push(PAGES.BRANDS.CREATE), SHORTKEYS.ENTER);

  return (
    <BrandsPage
      filterControls={filterControls}
      serverPagination={{ ...filterControls.listRequest, ...readListPagination(data) }}
      onRefetch={refetch}
      isLoading={loading}
      brands={loading ? [] : brands}
      onDownloadExcel={handleDownloadExcel}
      sideActions={sideActions}
    />
  );
};

export default Brands;
