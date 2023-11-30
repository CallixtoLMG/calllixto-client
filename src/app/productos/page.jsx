"use client";
import { createBatch, editBatch, productsList } from "@/api/products";
import ProductsPage from "@/components/products/ProductsPage";
import { useEffect, useState } from "react";


const Products = () => {
  const [products, setProducts] = useState();
  // const [createImportedBatch, setCreateImportedBatch] = useState();
  // const [editImportedBatch, setEditImportedBatch] = useState();

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
        // const fetchCreateBatch = await createBatch(requestOptions);
        // setCreateImportedBatch(fetchCreateBatch);
        // const fetchEditBatch = await editBatch(requestOptions);
        // setEditImportedBatch(fetchEditBatch)
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