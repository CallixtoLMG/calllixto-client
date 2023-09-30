"use client";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const CreateProduct = () => {
  const router = useRouter()
  const create = (product) => {
    var requestOptions = {
      method: 'POST',
      body: JSON.stringify(product),
      redirect: "follow",
      Headers: {
        'Content-type': 'application-json'
      },
      cache: "no-store"
    };

    fetch("https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/products", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
    toast.success("Cliente creado exitosamente");
    router.push(PAGES.PRODUCTS.BASE)
  };

  return (
    <ProductForm onSubmit={create} />
  )
};

export default CreateProduct;