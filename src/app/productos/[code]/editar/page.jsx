"use client"
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

async function showProduct(code) {
  const res = await fetch(`https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/products/${code}`);
  const data = await res.json()
  return data
};

function EditProduct({ params }) {
  
  const router = useRouter();
  const [product, setProduct] = useState(null);
  useEffect(() => {
    async function productData() {
      const data = await showProduct(params.code);
      setProduct(data);
    };
    productData();
  }, [params.code]);

  async function editProduct(product) {
    const requestOptions = {
      body: JSON.stringify(product),
      method: 'PUT',
      redirect: 'follow',
      Headers: {
        'Content-Type': 'application-json'
      },
      cache: "no-store",
    };

    fetch(`https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/products/${params.code}`, requestOptions)
      .then(async response => {
        let res = await response.text()
        res = JSON.parse(res)
        if (res.statusOk) {
          toast.success("Producto modificado exitosamente", { duration: 4000, position: "top-center" });
        } else {
          toast.error(res.message, { duration: 4000, position: "top-center" });
        }
      })
      .catch(error => console.log('error', error));
    router.push(PAGES.PRODUCTS.BASE)
  };

  return (
    <>
      {product && <ProductForm product={product.product} onSubmit={editProduct} />}
    </>
  )
};

export default EditProduct;

