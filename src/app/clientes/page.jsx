"use client";
import { customersList, deleteCustomer } from "@/api/customers";
import CustomersPage from "@/components/customers/CustomersPage";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Customers = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true)
  const [customers, setCustomers] = useState();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
    };
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
      } finally {
        setIsLoading(false)
      };
    };
    fetchData();
  }, []);

  const handleDeleteCustomer = async (id) => {
    try {
      await deleteCustomer(id);
      const updatedCustomers = customers.filter(customer => customer.id !== id);
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error('Error borrando customer', error);
    }
  };

  return (
    <CustomersPage customers={customers} isLoading={isLoading} onDelete={handleDeleteCustomer} />
  );
};

export default Customers;
