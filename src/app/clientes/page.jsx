"use client";
import { deleteCustomer, useListCustomers } from "@/api/customers";
import CustomersPage from "@/components/customers/CustomersPage";
import { Loader, useBreadcrumContext } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";
import { useEffect } from "react";

const Customers = () => {
  useValidateToken();
  const { customers, isLoading } = useListCustomers();
  const { setLabels } = useBreadcrumContext();

  useEffect(() => {
    setLabels(['Clientes']);
  }, [setLabels]);

  return (
    <Loader active={isLoading}>
      <CustomersPage customers={customers} onDelete={deleteCustomer} />
    </Loader>
  );
};

export default Customers;
