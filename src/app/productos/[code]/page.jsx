"use client";
import { edit, useGetProduct } from "@/api/products";
import { useBreadcrumContext, Loader } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useValidateToken } from "@/hooks/userData";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useEffect } from "react";

const Product = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { product, isLoading } = useGetProduct(params.code);
  const [allowUpdate, Toggle] = useAllowUpdate();
  const { setLabels } = useBreadcrumContext();

  useEffect(() => {
    setLabels(['Productos', product?.name]);
  }, [setLabels, product]);

  if (!isLoading && !product) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <Loader active={isLoading}>
      {Toggle}
      <ProductForm product={product} onSubmit={edit} readonly={!allowUpdate} />
    </Loader>
  )
};

export default Product;
