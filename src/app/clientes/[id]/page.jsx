"use client";
import { getCustomer } from "@/api/customers";
import ShowCustomer from "@/components/customers/ShowCustomer";
import { useEffect, useState } from "react";

const Customer = ({ params }) => {
  const [customer, setCustomer] = useState();
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
        const fetchCustomer = await getCustomer(params.id, requestOptions);
        setCustomer(fetchCustomer);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      };
    };
    fetchData();
  }, [params.id]);

  return (
    <ShowCustomer customer={customer} />
  );
};

export default Customer;