"use client";
import { create } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { useBreadcrumContext } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";

const CreateCustomer = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();

  useEffect(() => {
    setLabels(['Clientes', 'Crear']);
  }, [setLabels]);

  return (
    <CustomerForm onSubmit={create} />
  )
};

export default CreateCustomer;