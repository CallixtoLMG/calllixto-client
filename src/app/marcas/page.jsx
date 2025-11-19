"use client";
import { useUserContext } from "@/User";
import { useListBrands } from "@/api/brands";
import { COLORS, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel } from "@/common/utils";
import BrandsPage from "@/components/brands/BrandsPage";
import { BRAND_STATES } from "@/components/brands/brands.constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useKeyboardShortcuts, useValidateToken } from "@/hooks";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

const Brands = () => {
  useValidateToken();
  const { data, isLoading, isRefetching, refetch } = useListBrands();
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
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

  useEffect(() => {
    const actions = [];

    if (RULES.canCreate[role]) {
      actions.push({
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: () => { push(PAGES.BRANDS.CREATE) },
        text: 'Crear'
      })
    }

    setActions(actions);
  }, [push, role, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.BRANDS.CREATE), SHORTKEYS.ENTER);

  return (
    <BrandsPage
      onRefetch={refetch}
      isLoading={loading}
      brands={loading ? [] : brands}
      onDownloadExcel={handleDownloadExcel}
    />
  );
};

export default Brands;
