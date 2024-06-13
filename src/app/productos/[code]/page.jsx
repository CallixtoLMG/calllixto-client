"use client";
import { useUserContext } from "@/User";
import { GET_PRODUCT_QUERY_KEY, LIST_PRODUCTS_QUERY_KEY, edit, useGetProduct } from "@/api/products";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { Rules } from "@/visibilityRules";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import ProductView from "../../../components/products/ProductView";

const Product = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { data: product, isLoading } = useGetProduct(params.code);
  const [allowUpdate, Toggle] = useAllowUpdate();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const queryClient = useQueryClient();
  const { role } = useUserContext();
  const visibilityRules = Rules(role);

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Productos', product?.name]);
  }, [setLabels, product]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (product) => {
      const { data } = await edit(product);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [GET_PRODUCT_QUERY_KEY, params.id] });
        toast.success('Producto actualizado!');
        push(PAGES.PRODUCTS.BASE);
      } else {
        toast.error(response.message);
      }
    },
  });

  if (!isLoading && !product) {
    push(PAGES.NOT_FOUND.BASE);
  };

  return (
    <Loader active={isLoading}>
      {visibilityRules.canSeeActions && Toggle}
      {allowUpdate ? (
        <ProductForm product={product} onSubmit={mutate} isUpdating isLoading={isPending} />
      ) : (
        <ProductView product={product} />
      )}
    </Loader>
  )
};

export default Product;
