"use client";
import { createBatch, editBatch, productsList } from "@/api/products";
import { getUserRol } from "@/api/rol";
import ProductsPage from "@/components/products/ProductsPage";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Products = () => {
  const router = useRouter();
  const [products, setProducts] = useState();
  const [role, setRole] = useState();
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
    const fetchRol = async () => {
      try {
        const roles = await getUserRol();
        setRole(roles);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      };
    };
    fetchProductData();
    fetchRol()
  }, []);

  return (
    <ProductsPage products={products} createBatch={createBatch} editBatch={editBatch} role={role} />
  );
};

export default Products;