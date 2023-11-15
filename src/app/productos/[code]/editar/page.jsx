"use client"
import { editProduct, showProduct } from "@/apiCalls/products";
import ProductForm from "@/components/products/ProductForm";
import { useEffect, useState } from "react";

// async function showProduct(code) {
//   const res = await fetch(`${URL}${CLIENTID}${PATHS.PRODUCTS}/${code}`);
//   const data = await res.json()
//   return data
// };

function EditProduct({ params }) {

  const [product, setProduct] = useState(null);
  useEffect(() => {
    async function productData() {
      const data = await showProduct(params.code);
      setProduct(data);
    };
    productData();
  }, [params.code]);

  // async function editProduct(product) {
  //   const requestOptions = {
  //     body: JSON.stringify(product),
  //     method: 'PUT',
  //     redirect: 'follow',
  //     Headers: {
  //       'Content-Type': 'application-json'
  //     },
  //     cache: "no-store",
  //   };

  //   fetch(`${URL}${CLIENTID}${PATHS.PRODUCTS}/${params.code}`, requestOptions)
  //     .then(async response => {
  //       let res = await response.text()
  //       res = JSON.parse(res)
  //       if (res.statusOk) {
  //         toast.success("Producto modificado exitosamente", { duration: 4000, position: "top-center" });
  //       } else {
  //         toast.error(res.message, { duration: 4000, position: "top-center" });
  //       }
  //     })
  //     .catch(error => console.log('error', error));
  //   setTimeout(() => {
  //     router.push(PAGES.PRODUCTS.BASE)
  //   }, 500);
  // };

  return (
    <>
      {product && <ProductForm product={product.product} onSubmit={editProduct} />}
    </>
  )
};

export default EditProduct;

