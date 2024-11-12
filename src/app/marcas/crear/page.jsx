"use client";
import { useCreateBrand } from "@/api/brands";
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
  const createBrand = useCreateBrand();
  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.BRANDS.NAME, 'Crear']);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (brand) => {
      const response = await createBrand(brand);
      return response;
    },
    onSuccess: async (response) => {
      if (response.statusOk) {
        toast.success('Marca creada!');
        push(PAGES.BRANDS.BASE);
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
