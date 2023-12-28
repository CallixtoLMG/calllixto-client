"use client";
import { getCustomer } from "@/api/customers";
import ShowCustomer from "@/components/customers/ShowCustomer";
import { PageHeader, Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useValidateToken } from "@/hooks/userData";

const Customer = ({ params }) => {
  const { push } = useRouter();
  const [customer, setCustomer] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const token = useValidateToken();

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
        const fetchCustomer = await getCustomer(params.id, requestOptions);
        if (!fetchCustomer) {
          push(PAGES.NOT_FOUND.BASE);
          return;
        };
        setCustomer(fetchCustomer);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar cliente:', error);
      };
    };

    fetchData();
  }, [params.id, push, token]);

  return (
    <>
      <PageHeader title="Cliente" />
      <Loader active={isLoading}>
        <ShowCustomer customer={customer} />
      </Loader>
    </>
  );
};

export default Customer;
