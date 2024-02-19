"use client";
import { edit, useGetBrand, LIST_BRANDS_QUERY_KEY, GET_BRAND_QUERY_KEY } from "@/api/brands";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES, TIME_IN_MS } from "@/constants";
import { useRouter } from "next/navigation";
import { useValidateToken } from "@/hooks/userData";
import BrandForm from "@/components/brands/BrandForm";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const Brand = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { data: brand, isLoading, isRefetching } = useGetBrand(params.id);
  const [allowUpdate, Toggle] = useAllowUpdate();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Marcas', brand?.name]);
  }, [setLabels, brand]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (brand) => {
      const { data } = await edit(brand);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_BRANDS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [GET_BRAND_QUERY_KEY, params.id] });
        toast.success('Marca actualizada!');
      } else {
        toast.error(response.message);
      }
    },
  });

  if (!isLoading && !brand) {
    push(PAGES.NOT_FOUND.BASE);
  };

  return (
    <Loader active={isLoading || isRefetching}>
      {Toggle}
      <BrandForm brand={brand} onSubmit={mutate} readonly={!allowUpdate} isLoading={isPending} />
    </Loader>
  )
};

export default Brand;
