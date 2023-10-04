"use client"
import ProductForm from "@/components/products/ProductForm";
import { useEffect, useState } from "react";

async function showProduct(code) {
  const res = await fetch(`https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/products/${code}`);
  const data = await res.json()
  return data
};

function EditProduct({ params }) {
  const [product, setProduct] = useState(null)
  useEffect(() => {
    async function productData() {
      const data = await showProduct(params.code);
      console.log(data)
      setProduct(data)
    }
    productData()
  }, [params.code])

  async function editProduct(product) {
    console.log(product)
    const requestOptions = {
      body: JSON.stringify(product),
      method: 'PUT',
      redirect: 'follow',
      Headers: {
        'Content-Type': 'application-json'
      },
      cache: "no-store",
    };
    const response = await fetch(`https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/products/${params.code}`, requestOptions)
    const data = await response.json()
    console.log(data)
  };

  return (
    <>
      {product && <ProductForm product={product} onSubmit={editProduct} />}
    </>
  )
};

export default EditProduct;

