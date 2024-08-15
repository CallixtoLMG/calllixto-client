"use client";
import { create } from "@/api/brands";
import BrandForm from "@/components/brands/BrandForm";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const CreateBrand = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.BRANDS.NAME, 'Crear']);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (brand) => {
      const { data } = await create(brand);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Marca creada!');
        push(PAGES.BRANDS.BASE);
      } else {
        toast.error(response.message);
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
