"use client";
import { edit, useGetProduct } from "@/api/products";
import { PageHeader, Loader } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";

const EditProduct = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const role = useRole();
  const { product, isLoading } = useGetProduct(params.code);

  if (!isLoading && !product || role === "user") {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <>
      <PageHeader title="Actualizar Producto" />
      <Loader active={isLoading}>
        {product && <ProductForm product={product} onSubmit={edit} />}
      </Loader>
    </>
  )
};

export default EditProduct;

