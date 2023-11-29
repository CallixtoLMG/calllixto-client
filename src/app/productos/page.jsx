"use client";
import { productsList } from "@/api/products";
import ProductsPage from "@/components/products/ProductsPage";
import { useEffect, useState } from "react";

const Products = () => {
  const [products, setProducts] = useState();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchData = async () => {
      try {
        const requestOptions = {
          method: 'GET',
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: "no-store",
        };
        const fetchProducts = await productsList(requestOptions);
        setProducts(fetchProducts);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      };
    };
    fetchData();
  }, []);
  
  return (
    <ProductsPage products={products} />
  );
};

export default Products;