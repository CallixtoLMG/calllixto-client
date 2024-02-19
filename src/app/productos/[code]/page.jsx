"use client";
import { GET_PRODUCT_QUERY_KEY, LIST_PRODUCTS_QUERY_KEY, edit, useGetProduct } from "@/api/products";
import { useBreadcrumContext, Loader, useNavActionsContext } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useValidateToken } from "@/hooks/userData";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const Product = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { data: product, isLoading } = useGetProduct(params.code);
  const [allowUpdate, Toggle] = useAllowUpdate();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const queryClient = useQueryClient();

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
      {Toggle}
      <ProductForm product={product} onSubmit={mutate} readonly={!allowUpdate} isLoading={isPending} />
    </Loader>
  )
};

export default Product;
