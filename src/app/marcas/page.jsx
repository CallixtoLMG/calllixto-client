"use client";
import { useUserContext } from "@/User";
import { useListBrands } from "@/api/brands";
import BrandsPage from "@/components/brands/BrandsPage";
import { ATTRIBUTES } from "@/components/brands/brands.common";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { ENTITIES, PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Brands = () => {
  useValidateToken();
  const { data, isLoading } = useListBrands({ attributes: [ATTRIBUTES.NAME, ATTRIBUTES.ID, ATTRIBUTES.COMMENT] });
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();
  const { handleEntityChange } = usePaginationContext();

  useEffect(() => {
    handleEntityChange(ENTITIES.BRANDS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.BRANDS.NAME]);
  }, [setLabels]);

  const { brands } = useMemo(() => {
    return { brands: data?.brands }
  }, [data]);

  useEffect(() => {
    const actions = RULES.canCreate[role] ? [
      {
        id: 1,
        icon: 'add',
        color: 'green',
        onClick: () => { push(PAGES.BRANDS.CREATE) },
        text: 'Crear'
      }
    ] : [];
    setActions(actions);
  }, [push, role, setActions]);

  return (
    <BrandsPage
      isLoading={isLoading}
      brands={brands || []}
      role={role}
    />
  );
};

export default Brands;
