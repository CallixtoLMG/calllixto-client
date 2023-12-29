"use client";
import { deleteCustomer, useListCustomers } from "@/api/customers";
import CustomersPage from "@/components/customers/CustomersPage";
import { PageHeader, Loader } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";

const Customers = () => {
  useValidateToken();
  const { customers, isLoading } = useListCustomers();

  return (
    <>
      <PageHeader title="Clientes" />
      <Loader active={isLoading}>
        <CustomersPage customers={customers} onDelete={deleteCustomer} />
      </Loader>
    </>
  );
};

export default Customers;
