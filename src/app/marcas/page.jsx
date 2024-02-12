"use client";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import BrandsPage from "@/components/brands/BrandsPage";
import { useListBrands } from "@/api/brands";
import { useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PAGES } from "@/constants";
import { Rules } from "@/visibilityRules";
import { useUserContext } from "@/User";

const Brands = () => {
  useValidateToken();
  const { data: brands, isLoading, isRefetching } = useListBrands();
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels(['Marcas']);
  }, [setLabels]);

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
