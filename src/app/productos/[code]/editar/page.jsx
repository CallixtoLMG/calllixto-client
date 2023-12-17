"use client"
import { edit, getProduct } from "@/api/products";
import { getUserRol } from "@/api/rol";
import Loader from "@/components/layout/Loader";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditProduct = ({ params }) => {
  const router = useRouter();
  const [role, setRole] = useState();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
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
      setProduct(data);
      setIsLoading(false)
    };
    const fetchRol = async () => {
      try {
        const roles = await getUserRol();
        setRole(roles);
      } catch (error) {
        console.error('Error al cargar producto:', error);
      };
    };
    fetchData();
    fetchRol();
  }, [params.code]);
  if (role === "user") {
    router.push(PAGES.NOTFOUND.BASE)
  };
  return (
    <>
      <Loader active={isLoading}>
        {product && <ProductForm product={product} onSubmit={edit} />}
      </Loader>
    </>
  )
};

export default EditProduct;

