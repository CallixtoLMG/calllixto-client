"use client";
import { customersList } from "@/api/customers";
import CustomersPage from "@/components/customers/CustomersPage";
import Loader1 from "@/components/layout/Loader";
import { useEffect, useState } from "react";

const Customers = () => {
  const [loader, setLoader] = useState(true)
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
        setLoader(false)
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <Loader1 active={loader}>
      <CustomersPage customers={customers} />
    </Loader1>
  );
};

export default Customers;
