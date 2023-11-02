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

    fetch("https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/products", requestOptions)
      .then(async response => {
        let res = await response.text()
        res = JSON.parse(res)
        if (res.statusOk) {
          toast.success("Producto creado exitosamente");
        } else {
          toast.error(res.message);
        }
      })
      .catch(error => console.log('error', error));
    router.push(PAGES.PRODUCTS.BASE)
  };

  return (
    <ProductForm onSubmit={create} />
  )
};

export default CreateProduct;