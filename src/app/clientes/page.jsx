"use client";
import { customersList, deleteCustomer } from "@/api/customers";
import { getUserData } from "@/api/userData";
import CustomersPage from "@/components/customers/CustomersPage";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderContainer } from "../../components/customers/CustomersPage/styles";
import Loader from "@/components/layout/Loader";
import PageHeader from "@/components/layout/PageHeader";

const Customers = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true)
  const [customers, setCustomers] = useState();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(PAGES.LOGIN.BASE)
    };
    const validateToken = async () => {
      try {
        const userData = await getUserData();
        if (!userData.isAuthorized) {
          router.push(PAGES.LOGIN.BASE)
        };
      } catch (error) {
        console.error('Error, ingreso no valido(token):', error);
      };
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
    validateToken();
    fetchData();
  }, [router]);

  const handleDeleteCustomer = async (id) => {
    try {
      await deleteCustomer(id);
      const updatedCustomers = customers.filter(customer => customer.id !== id);
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error('Error borrando cliente', error);
    }
  };

  return (
    <>
      <HeaderContainer>
        <PageHeader title="Clientes" />
      </HeaderContainer>
      <Loader active={isLoading}>
        <CustomersPage customers={customers} onDelete={handleDeleteCustomer} />
      </Loader>
    </>
  );
};

export default Customers;
