"use client"
import { getProduct } from "@/api/products";
import { getUserData } from "@/api/userData";
import { PageHeader, Loader } from "@/components/layout";
import ShowProduct from "@/components/products/ShowProduct";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Product = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState({})
  const { push } = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      push(PAGES.LOGIN.BASE);
    };
    const validateToken = async () => {
      try {
        const userData = await getUserData();
        if (!userData.isAuthorized) {
          push(PAGES.LOGIN.BASE);
        };
      } catch (error) {
        console.error('Error, ingreso no valido(token):', error);
      };
    };
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
    validateToken()
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
