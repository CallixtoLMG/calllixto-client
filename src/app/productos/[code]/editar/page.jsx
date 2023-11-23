"use client"
import { edit, getProduct } from "@/api/products";
import ProductForm from "@/components/products/ProductForm";
import { useEffect, useState } from "react";

function EditProduct({ params }) {
  const code = params.code;

  const [product, setProduct] = useState(null);
  useEffect(() => {
    async function productData() {
      const data = await getProduct(params.code);
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

