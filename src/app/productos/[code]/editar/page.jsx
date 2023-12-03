"use client"
import { edit, getProduct } from "@/api/products";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditProduct = ({ params }) => {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
    };
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
    };
    fectchData();
  }, [params.code]);

  return (
    <>
      {product && <ProductForm product={product} onSubmit={edit} />}
    </>
  )
};

export default EditProduct;

