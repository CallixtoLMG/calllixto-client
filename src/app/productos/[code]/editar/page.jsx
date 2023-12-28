"use client";
import { edit, getProduct } from "@/api/products";
import { PageHeader, Loader } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditProduct = ({ params }) => {
  const { push } = useRouter();
  const role = useRole();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = useValidateToken();

  useEffect(() => {
    async function fetchData() {
      var requestOptions = {
        method: 'GET',
        redirect: 'follow',
        headers: {
          authorization: `Bearer ${token}`
        },
        cache: "no-store",
      };
      const data = await getProduct(params.code, requestOptions);
      if (!data) {
        push(PAGES.NOT_FOUND.BASE);
        return;
      };
      setProduct(data);
      setIsLoading(false)
    };

    fetchData();
  }, [params.code, push, token]);

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

