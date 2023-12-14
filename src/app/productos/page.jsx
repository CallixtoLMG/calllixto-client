"use client";
import { createBatch, deleteProduct, editBatch, productsList } from "@/api/products";
import { getUserRol } from "@/api/rol";
import ProductsPage from "@/components/products/ProductsPage";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Products = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState();
  const [role, setRole] = useState();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
    };
    const requestOptions = {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    };
    const fetchRol = async () => {
      try {
        const roles = await getUserRol();
        setRole(roles);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
    };
    const fetchProductData = async () => {
      try {
        const fetchProducts = await productsList(requestOptions);
        setProducts(fetchProducts);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      } finally {
        setIsLoading(false)
      };
    };
    fetchProductData();
    fetchRol()
  }, []);

  const handleDeleteProduct = async (code) => {
    try {
      await deleteProduct(code);
      const updatedProducts = products.filter(product => product.code !== code);
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error borrando customer', error);
    }
  };

  return (
    <ProductsPage
      products={products}
      createBatch={createBatch}
      editBatch={editBatch}
      role={role}
      isLoading={isLoading}
      onDelete={handleDeleteProduct}
    />
  );
};

export default Products;
