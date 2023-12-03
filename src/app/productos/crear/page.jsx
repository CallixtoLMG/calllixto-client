"use client"
import { create } from "@/api/products";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CreateProduct = () => {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
    };
  }, []);

  return (
    <ProductForm onSubmit={create} />
  )
};

export default CreateProduct;