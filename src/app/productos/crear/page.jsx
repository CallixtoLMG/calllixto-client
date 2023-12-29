"use client"
import { brandsList } from "@/api/brands";
import { create } from "@/api/products";
import { suppliersList } from "@/api/suppliers";
import { getUserData } from "@/api/userData";
import { PageHeader } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CreateProduct = () => {
  const { push } = useRouter();
  const [brands, setBrandsList] = useState(null);
  const [suppliers, setSuppliersList] = useState(null);
  const [role, setRole] = useState();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      push(PAGES.LOGIN.BASE);
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
        console.error('Error, rol no valido:', error);
      };
    };
    const fetchData = async () => {
      const requestOptions = {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: "no-store",
      };
      try {
        const brandsData = await brandsList(requestOptions);
        const brandsFilteredList = brandsData.map(brand => ({
          ...brand,
          key: brand.id,
          value: brand.name,
          text: brand.name,
          default: "",
        }));
        setBrandsList(brandsFilteredList)
      } catch (error) {
        console.error('Error al cargar las marcas:', error);
      };
      try {
        const suppliersData = await suppliersList(requestOptions);
        const suppliersFilteredList = suppliersData.map(supplier => ({
          ...supplier,
          key: supplier.id,
          value: supplier.name,
          text: supplier.name,
        }));
        setSuppliersList(suppliersFilteredList)
      } catch (error) {
        console.error('Error al cargar las proveedores:', error);
      };
    };
    fetchData();
    validateToken();
    fetchRol();
  }, [push]);
  if (role === "user") {
    push(PAGES.NOT_FOUND.BASE)
  };
  return (
    <>
      <PageHeader title="Crear Producto" />
      <ProductForm brands={brands} suppliers={suppliers} onSubmit={create} />
    </>
  )
};

export default CreateProduct;
