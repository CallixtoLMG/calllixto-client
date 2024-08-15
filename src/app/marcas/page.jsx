"use client";
import { useUserContext } from "@/User";
import { LIST_ALL_BRANDS_QUERY_KEY, useListAllBrands } from "@/api/brands";
import BrandsPage from "@/components/brands/BrandsPage";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { ENTITIES, PAGES, SHORTKEYS } from "@/constants";
import { useRestoreEntity } from "@/hooks/common";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Brands = () => {
  useValidateToken();
  const { data, isLoading, isRefetching } = useListAllBrands();
  const restoreEntity = useRestoreEntity({ entity: ENTITIES.BRANDS, key: LIST_ALL_BRANDS_QUERY_KEY });
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([PAGES.BRANDS.NAME]);
  }, [setLabels]);

  const brands = useMemo(() => data?.brands, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  useEffect(() => {
    const handleRestore = async () => {
      await restoreEntity();
    };

    const actions = RULES.canCreate[role] ? [
      {
        id: 1,
        icon: 'add',
        color: 'green',
        onClick: () => { push(PAGES.BRANDS.CREATE) },
        text: 'Crear'
      }
    ] : [];
    actions.push({
      id: 2,
      icon: 'undo',
      color: 'grey',
      onClick: handleRestore,
      text: 'Actualizar',
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
