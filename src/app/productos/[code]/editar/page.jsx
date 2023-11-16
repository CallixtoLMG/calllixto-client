"use client"
import { edit } from "@/api/products";
import ProductForm from "@/components/products/ProductForm";
import { useEffect, useState } from "react";

function EditProduct({ params }) {
  console.log(params.code)
  const code = params.code

  const [product, setProduct] = useState(null);
  useEffect(() => {
    async function productData() {
      const data = await get(params.code);
      setProduct(data);
    };
    productData();
  }, [params.code]);

  return (
    <>
      {product && <ProductForm product={product.product} onSubmit={edit} code={code} />}
    </>
  )
};

export default EditProduct;

