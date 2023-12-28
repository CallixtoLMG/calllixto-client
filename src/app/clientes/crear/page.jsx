"use client"
import { create } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { PageHeader } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";

const CreateCustomer = () => {
  useValidateToken();

  return (
    <>
      <PageHeader title="Crear Cliente" />
      <CustomerForm onSubmit={create} />
    </>
  )
};

export default CreateCustomer;