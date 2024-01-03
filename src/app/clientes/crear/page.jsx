"use client";
import { create } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";

const CreateCustomer = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();

  useEffect(() => {
    resetActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Clientes', 'Crear']);
  }, [setLabels]);

  return (
    <CustomerForm onSubmit={create} />
  )
};

export default CreateCustomer;
