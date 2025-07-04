"use client";
import { useCreateBrand } from "@/api/brands";
import BrandForm from "@/components/brands/BrandForm";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/common/constants";
import { useValidateToken } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const CreateBrand = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const { push } = useRouter();
  const createBrand = useCreateBrand();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.BRANDS.NAME, 'Crear']);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: createBrand,
    onSuccess: async (response) => {
      if (response.statusOk) {
        push(PAGES.BRANDS.SHOW(response.brand.id))
        toast.success('Marca creada!');
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  return (
    <BrandForm onSubmit={mutate} isLoading={isPending} />
  )
};

export default CreateBrand;
