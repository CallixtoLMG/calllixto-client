"use client";
import { customersList } from "@/api/customers";
import CustomersPage from "@/components/customers/CustomersPage";
import { useEffect, useState } from "react";

const Customers = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [customers, setCustomers] = useState();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchData = async () => {
      try {
        const requestOptions = {
          method: 'GET',
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: "no-store",
        };
        const fetchCustomers = await customersList(requestOptions);
        setCustomers(fetchCustomers);
        setIsLoading(false)
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
    };
    fetchData();
  }, []);

  return (
      <CustomersPage customers={customers} isLoading={isLoading} />
  );
};

export default Customers;
