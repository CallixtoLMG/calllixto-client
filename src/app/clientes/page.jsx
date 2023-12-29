"use client";
import { deleteCustomer, list } from "@/api/customers";
import CustomersPage from "@/components/customers/CustomersPage";
import { PageHeader, Loader } from "@/components/layout";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Customers = () => {
  useValidateToken();
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const customers = await list();
      setCustomers(customers);
      setIsLoading(false);
    };
    fetchData();
  }, [push]);

  const handleDeleteCustomer = async (id) => {
    await deleteCustomer(id);
    setCustomers(customers.filter(customer => customer.id !== id));
  };

  return (
    <>
      <PageHeader title="Clientes" />
      <Loader active={isLoading}>
        <CustomersPage customers={customers} onDelete={handleDeleteCustomer} />
      </Loader>
    </>
  );
};

export default Customers;
