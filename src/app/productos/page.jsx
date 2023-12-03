"use client";
import { createBatch, editBatch, productsList } from "@/api/products";
import ProductsPage from "@/components/products/ProductsPage";
import { PAGES } from "@/constants";
// import { URL } from "@/fetchUrls";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Products = () => {
  const router = useRouter();
  const [products, setProducts] = useState();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
    };
    const requestOptions = {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: "no-store",
    };
    const fetchProductData = async () => {
      try {
        const fetchProducts = await productsList(requestOptions);
        setProducts(fetchProducts);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      };
    };
    // const response = async () => {
    //   try {
    //     const response = await fetch(`${URL}validate`, requestOptions);
    //     let res = await response.text()
    //     console.log("HOLA")
    //   } catch (error) {
    //     console.error('Error al cargar clientes:', error);
    //   };
    // };
    // response()
    fetchProductData();
  }, []);

  return (
    <ProductsPage products={products} createBatch={createBatch} editBatch={editBatch} />
  );
};

export default Products;