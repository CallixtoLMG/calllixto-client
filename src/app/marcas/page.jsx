"use client";
import { useUserContext } from "@/User";
import { LIST_BRANDS_QUERY_KEY, useListBrands } from "@/api/brands";
import BrandsPage from "@/components/brands/BrandsPage";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { COLORS, ENTITIES, ICONS, PAGES, SHORTKEYS } from "@/constants";
import { useRestoreEntity } from "@/hooks/common";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { downloadExcel } from "@/utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Brands = () => {
  useValidateToken();
  const { data, isLoading, isRefetching } = useListBrands();
  const restoreEntity = useRestoreEntity({ entity: ENTITIES.BRANDS, key: LIST_BRANDS_QUERY_KEY });
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([PAGES.BRANDS.NAME]);
  }, [setLabels]);

  const brands = useMemo(() => data?.brands, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  const prepareBrandDataForExcel = useMemo(() => {
    if (!brands) return [];

    const headers = ['ID', 'Nombre', 'Comentarios'];

    const brandData = brands.map(brand => [
      brand.id,
      brand.name,
      brand.comments,
    ]);

    return [headers, ...brandData];
  }, [brands]);

  useEffect(() => {
    const handleRestore = async () => {
      await restoreEntity();
    };

    const actions = RULES.canCreate[role] ? [
      {
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: () => { push(PAGES.BRANDS.CREATE) },
        text: 'Crear'
      }
    ] : [];
    actions.push({
      id: 2,
      icon: ICONS.UNDO,
      color: COLORS.GREY,
      onClick: handleRestore,
      text: 'Actualizar',
      disabled: loading,
      width: "fit-content",
    });

    actions.push({
      id: 3,
      icon: ICONS.FILE_EXCEL,
      color: COLORS.SOFT_GREY,
      onClick: () => {
        downloadExcel(prepareBrandDataForExcel, "Lista de Marcas");
      },
      text: 'Marcas',
      disabled: loading
    });
    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, role, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.BRANDS.CREATE), SHORTKEYS.ENTER);

  return (
    <BrandsPage
      isLoading={loading}
      brands={loading ? [] : brands}
      role={role}
    />
  );
};

export default Brands;
