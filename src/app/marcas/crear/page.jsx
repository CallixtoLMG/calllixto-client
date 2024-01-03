"use client";
import { create } from "@/api/brands";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import BrandForm from "@/components/brands/BrandForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";

const CreateBrand = () => {
  useValidateToken();
  const { push } = useRouter();
  const role = useRole();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();

  useEffect(() => {
    resetActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Marcas', 'Crear']);
  }, [setLabels]);

  if (role === "user") {
    push(PAGES.NOT_FOUND.BASE);
  };

  return (
    <BrandForm onSubmit={create} />
  )
};

export default CreateBrand;
