"use client";
import { PageHeader, Loader } from "@/components/layout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteSupplier, list } from "@/api/suppliers";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import { useRole, useValidateToken } from "@/hooks/userData";

const Suppliers = () => {
  useValidateToken();
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState();
  const role = useRole();

  useEffect(() => {
    const fetchData = async () => {
      const suppliers = await list();
      setSuppliers(suppliers);
      setIsLoading(false);
    };
    fetchData();
  }, [push]);

  const handleDeleteSupplier = async (id) => {
    await deleteSupplier(id);
    setSuppliers(suppliers.filter(suplier => suplier.id !== id));
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
