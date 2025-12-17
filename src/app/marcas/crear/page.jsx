"use client";
import { useCreateBrand } from "@/api/brands";
import { PAGES } from "@/common/constants";
import BrandForm from "@/components/brands/BrandForm";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useValidateToken } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const CreateBrand = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setInfo } = useNavActionsContext();
  const { push } = useRouter();
  const createBrand = useCreateBrand();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([{ name: PAGES.BRANDS.NAME }, { name: 'Crear' }]);
    setInfo(null);
  }, [setLabels, setInfo]);

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
