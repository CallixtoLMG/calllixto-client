"use client";
import { edit, useGetBrand } from "@/api/brands";
import BrandForm from "@/components/brands/BrandForm";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import BrandView from "../../../components/brands/BrandView";
import { useUserContext } from "@/User";
import { RULES } from "@/roles";

const Brand = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: brand, isLoading } = useGetBrand(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const [isUpdating, Toggle] = useAllowUpdate({ canUpdate: RULES.canUpdate[role] });

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels([PAGES.BRANDS.NAME, brand?.name]);
  }, [setLabels, brand]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (brand) => {
      const { data } = await edit(brand);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Marca actualizada!');
        push(PAGES.BRANDS.BASE);
      } else {
        toast.error(response.message);
      }
    },
  });

  if (!isLoading && !brand) {
    push(PAGES.NOT_FOUND.BASE);
  };

  return (
    <Loader active={isLoading}>
      {Toggle}
      {isUpdating ? (
        <BrandForm brand={brand} onSubmit={mutate} isLoading={isPending} isUpdating />
      ) : (
        <BrandView brand={brand} />
      )}
    </Loader>
  )
};

export default Brand;
