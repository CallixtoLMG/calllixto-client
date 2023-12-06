"use client"
import { getProduct } from "@/api/products";
import ShowProduct from "@/components/products/ShowProduct";
import Loader from "@/components/layout/Loader"
import { useEffect, useState } from "react";


const Product = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState({})
  useEffect(() => {
    const token = localStorage.getItem('token');
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
        console.error('Error al cargar clientes:', error);
      };
    };
    fetchData();
  }, [params.code]);

  return (
       <ShowProduct product={product} isLoading={isLoading}/>
  )
};

export default Product;
