"use client";
import { useGetProduct } from "@/api/products";
import { PageHeader, Loader } from "@/components/layout";
import ShowProduct from "@/components/products/ShowProduct";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useValidateToken } from "@/hooks/userData";

const Product = ({ params }) => {
  useValidateToken();
  const { product, isLoading } = useGetProduct(params.code);
  const { push } = useRouter();

  if (!isLoading && !product) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <>
      <PageHeader title="Producto" />
      <Loader active={isLoading}>
        <ShowProduct product={product} />
      </Loader>
    </>
  )
};

export default Product;
