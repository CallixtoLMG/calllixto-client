"use client";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import BrandsPage from "@/components/brands/BrandsPage";
import { deleteBrand, useListBrands } from "@/api/brands";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PAGES } from "@/constants";
import { Rules } from "@/visibilityRules";

const Brands = () => {
  useValidateToken();
  const { brands, isLoading } = useListBrands();
  const role = useRole();
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
    <Loader active={isLoading}>
      <BrandsPage
        brands={brands || []}
        role={role}
        isLoading={isLoading}
        onDelete={deleteBrand}
      />
    </Loader>
  );
};

export default Brands;
