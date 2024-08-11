"use client";
import { useUserContext } from "@/User";
import { useListAllBrands } from "@/api/brands";
import BrandsPage from "@/components/brands/BrandsPage";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Brands = () => {
  useValidateToken();
  const { data, isLoading } = useListAllBrands();
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

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

  useKeyboardShortcuts(() => push(PAGES.BRANDS.CREATE), SHORTKEYS.ENTER);

  return (
    <BrandsPage
      isLoading={isLoading}
      brands={brands || []}
      role={role}
    />
  );
};

export default Brands;
