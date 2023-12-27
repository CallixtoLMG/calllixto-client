"use client";
import { getUserData } from "@/api/userData";
import { PageHeader, Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { suppliersList, deleteSupplier } from "@/api/suppliers";
import SuppliersPage from "@/components/suppliers/SuppliersPage";

const Suppliers = () => {
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState();
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

    const fetchSuppliers = async () => {
      try {
        const suppliers = await suppliersList(requestOptions);
        setSuppliers(suppliers);
      } catch (error) {
        console.error("Error al cargar marcas:", error);
      } finally {
        setIsLoading(false);
      };
    };

    validateToken();
    fetchSuppliers();
    fetchRol();
  }, [push]);

  const handleDeleteSupplier = async (id) => {
    try {
      await deleteSupplier(id);
      const updatedSuppliers = suppliers.filter(suplier => suplier.id !== id);
      setSuppliers(updatedSuppliers);
    } catch (error) {
      console.error('Error borrando marca', error);
    };
  };

  return (
    <>
      <PageHeader title={"Proveedores"} />
      <Loader active={isLoading}>
        <SuppliersPage
          suppliers={suppliers}
          role={role}
          isLoading={isLoading}
          onDelete={handleDeleteSupplier}
        />
      </Loader>
    </>
  );
};

export default Suppliers;
