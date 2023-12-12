"use client"
import { create } from "@/api/products";
import { getUserRol } from "@/api/rol";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CreateProduct = () => {
  const router = useRouter();
  const [role, setRole] = useState();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
    };
    const fetchRol = async () => {
      try {
        const roles = await getUserRol();
        setRole(roles);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      };
    };
    setRole(fetchRol());
    console.log(role)
  }, []);
  if (role === "user") {
    router.push(PAGES.NOTFOUND.BASE)
  };
  return (
    <ProductForm onSubmit={create} />
  )
};

export default CreateProduct;
