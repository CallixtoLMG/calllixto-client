"use client"
import { getProduct } from "@/api/products";
import ShowProduct from "@/components/products/ShowProduct";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Product = ({ params }) => {
  const [product, setProduct] = useState({})
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
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
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      };
    };
    fetchData();
  }, [params.code]);

  return (
    <ShowProduct product={product} />
  )
};

export default Product;