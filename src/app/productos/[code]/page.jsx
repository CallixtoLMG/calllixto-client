"use client"
import { getProduct } from "@/api/products";
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
        setIsLoading(false)
        
      } catch (error) {
        console.error('Error al cargar productos:', error);
      };
    };
    fetchData();
  }, [params.code]);

  return (
       <ShowProduct product={product} isLoading={isLoading}/>
  )
};

export default Product;
