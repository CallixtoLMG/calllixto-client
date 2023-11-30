"use client";
import { createBatch, editBatch, productsList } from "@/api/products";
import ProductsPage from "@/components/products/ProductsPage";
import { useEffect, useState } from "react";

const Products = () => {
  const [products, setProducts] = useState();
  useEffect(() => {
    const token = localStorage.getItem('token');
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
    fetchProductData();
  }, []);

  return (
    <ProductsPage products={products} createBatch={createBatch} editBatch={editBatch} />
  );
};

export default Products;