"use client"
import { create } from "@/api/products";
import ProductForm from "@/components/products/ProductForm";

const CreateProduct = () => {
  return (
    <ProductForm onSubmit={create} />
  )
};

export default CreateProduct;
