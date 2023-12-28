"use client";
import { createBatch, deleteProduct, editBatch, productsList } from "@/api/products";
import { Loader, PageHeader } from "@/components/layout";
import ProductsPage from "@/components/products/ProductsPage";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Products = () => {
  const token = useValidateToken();
  const role = useRole();
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState();

  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
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

    fetchProductData();
  }, [push, token]);

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
