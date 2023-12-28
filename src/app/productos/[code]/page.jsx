"use client";
import { getProduct } from "@/api/products";
import { PageHeader, Loader } from "@/components/layout";
import ShowProduct from "@/components/products/ShowProduct";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useValidateToken } from "@/hooks/userData";

const Product = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState({})
  const { push } = useRouter();
  const token = useValidateToken();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestOptions = {
          method: 'GET',
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: "no-store",
        };
        const fetchProduct = await getProduct(params.code, requestOptions);
        if (!fetchProduct) {
          push(PAGES.NOT_FOUND.BASE);
          return;
        };
        setProduct(fetchProduct);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      };
    };

    fetchData();
  }, [params.code, push, token]);

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
