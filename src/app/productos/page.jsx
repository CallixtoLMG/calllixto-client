"use client";
import { createBatch, deleteProduct, editBatch, list } from "@/api/products";
import { Loader, PageHeader } from "@/components/layout";
import ProductsPage from "@/components/products/ProductsPage";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Products = () => {
  useValidateToken();
  const role = useRole();
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const products = await list();
      setProducts(products);
      setIsLoading(false)
    };
    fetchData();
  }, [push]);

  const handleDeleteProduct = async (code) => {
    await deleteProduct(code);
    setProducts(products.filter(product => product.code !== code));
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
