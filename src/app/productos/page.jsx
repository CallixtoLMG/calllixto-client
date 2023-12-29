"use client";
import { createBatch, deleteProduct, editBatch, useListProducts } from "@/api/products";
import { Loader, PageHeader } from "@/components/layout";
import ProductsPage from "@/components/products/ProductsPage";
import { useRole, useValidateToken } from "@/hooks/userData";

const Products = () => {
  useValidateToken();
  const role = useRole();
  const { products, isLoading } = useListProducts();

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
          onDelete={deleteProduct}
        />
      </Loader>
    </>
  );
};

export default Products;
