"use client"
import { edit, getProduct } from "@/api/products";
import ProductForm from "@/components/products/ProductForm";
import Loader from "@/components/layout/Loader";
import { useEffect, useState } from "react";

const EditProduct = ({ params }) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const token = localStorage.getItem('token');
    async function fectchData() {
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
    fectchData();
  }, [params.code]);

  return (
    <>
      {product && 
        <Loader active={isLoading}>
          <ProductForm product={product} onSubmit={edit} />
        </Loader>
      }
    </>
  )
};

export default EditProduct;

