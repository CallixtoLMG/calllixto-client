"use client";
import { create } from "@/api/brands";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import BrandForm from "@/components/brands/BrandForm";
import { useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";

const CreateBrand = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Marcas', 'Crear']);
  }, [setLabels]);

  return (
    <BrandForm onSubmit={create} />
  )
};

export default CreateBrand;
