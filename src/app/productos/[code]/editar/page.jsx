"use client"
import { edit, getProduct } from "@/api/products";
import { getUserData } from "@/api/userData";
import Loader from "@/components/layout/Loader";
import PageHeader from "@/components/layout/PageHeader";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditProduct = ({ params }) => {
  const { push } = useRouter();
  const [role, setRole] = useState();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      push(PAGES.LOGIN.BASE);
    };
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
        push(PAGES.NOTFOUND.BASE);
        return;
      };
      setProduct(data);
      setIsLoading(false)
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
    const fetchRol = async () => {
      try {
        const userData = await getUserData();
        setRole(userData.roles[0]);
      } catch (error) {
        console.error('Error al cargar producto:', error);
      };
    };
    validateToken();
    fetchData();
    fetchRol();
  }, [params.code]);
  if (role === "user") {
    push(PAGES.NOTFOUND.BASE);
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

