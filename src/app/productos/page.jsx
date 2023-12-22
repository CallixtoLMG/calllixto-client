"use client";
import { createBatch, deleteProduct, editBatch, productsList } from "@/api/products";
import { getUserData } from "@/api/userData";
import { PageHeader, Loader } from "@/components/layout";
import ProductsPage from "@/components/products/ProductsPage";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Products = () => {
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState();
  const [role, setRole] = useState();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      push(PAGES.LOGIN.BASE);
    };
    const requestOptions = {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    };
    const validateToken = async () => {
      try {
        const userData = await getUserData();
        if (!userData.isAuthorized) {
          push(PAGES.LOGIN.BASE);
        };
      } catch (error) {
        console.error('Error, ingreso no valido(token):', error);
      };
    };
    const fetchRol = async () => {
      try {
        const userData = await getUserData();
        setRole(userData.roles[0]);
      } catch (error) {
        console.error('Error al cargar roles:', error);
      };
    };
    const fetchProductData = async () => {
      try {
        const fetchProducts = await productsList(requestOptions);
        setProducts(fetchProducts);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setIsLoading(false)
      };
    };
    validateToken();
    fetchProductData();
    fetchRol();
  }, []);

  const handleDeleteProduct = async (code) => {
    try {
      await deleteProduct(code);
      const updatedProducts = products.filter(product => product.code !== code);
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error borrando producto', error);
    };
  };

  return (
    <>
      <PageHeader title={"Productos"} />
      <Loader active={isLoading}>
        <ProductsPage
          products={products}
          createBatch={createBatch}
          editBatch={editBatch}
          role={role}
          isLoading={isLoading}
          onDelete={handleDeleteProduct}
        />
      </Loader>
    </>
  );
};

export default Products;
