"use client";
import { useUserContext } from "@/User";
import { useListBrands } from "@/api/brands";
import BrandsPage from "@/components/brands/BrandsPage";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { Rules } from "@/visibilityRules";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Brands = () => {
  useValidateToken();
  const { data, isLoading, isRefetching } = useListBrands({ sort: 'name', order: false });
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels(['Marcas']);
  }, [setLabels]);

  const { brands } = useMemo(() => {
    return { brands: data?.brands }
  }, [data]);

  useEffect(() => {
    const visibilityRules = Rules(role);
    const actions = visibilityRules.canSeeButtons ? [
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
    <Loader active={isLoading || isRefetching}>
      <BrandsPage
        brands={brands || []}
        role={role}
      />
    </Loader>
  );
};

export default Brands;
