"use client";
import { customersList } from "@/api/customers";
import CustomersPage from "@/components/customers/CustomersPage";
import { useEffect, useState } from "react";

const Customers = () => {
  const [customers, setCustomers] = useState();
  const token = localStorage.getItem('token');

  useEffect(() => {
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
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
    };

    fetchData();
  }, [token]);

  return (
    <CustomersPage customers={customers} />
  );
};

export default Customers;
