"use client";
import { PageHeader, Loader } from "@/components/layout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { suppliersList, deleteSupplier } from "@/api/suppliers";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { useRole, useValidateToken } from "@/hooks/userData";

const Suppliers = () => {
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState();
  const role = useRole();
  const token = useValidateToken();

  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
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

    fetchSuppliers();
  }, [push, token]);

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
