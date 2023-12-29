"use client";
import { edit, getProduct } from "@/api/products";
import { PageHeader, Loader } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditProduct = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const role = useRole();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const product = await getProduct(params.code);

      if (!product) {
        push(PAGES.NOT_FOUND.BASE);
        return;
      };

      setProduct(product);
      setIsLoading(false)
    };

    fetchData();
  }, [params.code, push]);

  if (role === "user") {
    push(PAGES.NOT_FOUND.BASE);
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

