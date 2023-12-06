"use client"
import { edit, getProduct } from "@/api/products";
import { getUserRol } from "@/api/rol";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditProduct = ({ params }) => {
  const router = useRouter();
  const [role, setRole] = useState();
  const [product, setProduct] = useState(null);
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
    };
    const fetchRol = async () => {
      try {
        const roles = await getUserRol();
        setRole(roles);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
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
      {product && <ProductForm product={product} onSubmit={edit} />}
    </>
  )
};

export default EditProduct;

