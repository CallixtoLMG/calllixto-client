"use client"
import { getProduct } from "@/api/products";
import { getUserData } from "@/api/userData";
import { HeaderContainer } from "@/components/customers/CustomersPage/styles";
import Loader from "@/components/layout/Loader";
import PageHeader from "@/components/layout/PageHeader";
import ShowProduct from "@/components/products/ShowProduct";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Product = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState({})
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
    };
    const validateToken = async () => {
      try {
        const userData = await getUserData();
        if (!userData.isAuthorized) {
          router.push(PAGES.LOGIN.BASE)
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
        setProduct(fetchProduct);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      };
    };
    validateToken()
    fetchData();
  }, [params.code, router]);

  return (
    <>
      <HeaderContainer>
        <PageHeader title="Producto" />
      </HeaderContainer>
      <Loader active={isLoading}>
        <ShowProduct product={product} />
      </Loader>
    </>
  )
};

export default Product;
