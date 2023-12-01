"use client";
import { getCustomer } from "@/api/customers";
import ShowCustomer from "@/components/customers/ShowCustomer";
import Loader1 from "@/components/layout/Loader";
import { useEffect, useState } from "react";

const Customer = ({ params }) => {
  const [customer, setCustomer] = useState();
  const [loader, setLoader] = useState(true)
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
        setLoader(false)
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      };
    };
    fetchData();
  }, [params.id]);

  return (
    <Loader1 active={loader}>
      <ShowCustomer customer={customer} />
    </Loader1>
  );
};

export default Customer;
