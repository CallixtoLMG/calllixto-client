"use client";
import { getProduct } from "@/api/products";
import { PageHeader, Loader } from "@/components/layout";
import ShowProduct from "@/components/products/ShowProduct";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useValidateToken } from "@/hooks/userData";

const Product = ({ params }) => {
  useValidateToken();
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState({})
  const { push } = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const product = await getProduct(params.code);

      if (!product) {
        push(PAGES.NOT_FOUND.BASE);
        return;
      };

      setProduct(product);
      setIsLoading(false);
    }

    fetchData();
  }, [params.code, push]);

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
