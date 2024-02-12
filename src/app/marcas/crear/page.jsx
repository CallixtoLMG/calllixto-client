"use client";
import { LIST_BRANDS_QUERY_KEY, create } from "@/api/brands";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import BrandForm from "@/components/brands/BrandForm";
import { useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { PAGES } from "@/constants";

const CreateBrand = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const queryClient = useQueryClient();
  const { push } = useRouter();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Marcas', 'Crear']);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (brand) => {
      const { data } = await create(brand);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_BRANDS_QUERY_KEY] });
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
