"use client";
import { createBatch, deleteProduct, editBatch, useListProducts } from "@/api/products";
import { Loader, useBreadcrumContext } from "@/components/layout";
import ProductsPage from "@/components/products/ProductsPage";
import { useRole, useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";

const Products = () => {
  useValidateToken();
  const role = useRole();
  const { products, isLoading } = useListProducts();
  const { setLabels } = useBreadcrumContext();

  useEffect(() => {
    setLabels(['Productos']);
  }, [setLabels]);

  return (
    <Loader active={isLoading}>
      <ProductsPage
        products={products}
        createBatch={createBatch}
        editBatch={editBatch}
        role={role}
        isLoading={isLoading}
        onDelete={deleteProduct}
      />
    </Loader>
  );
};

export default Products;
