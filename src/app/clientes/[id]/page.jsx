"use client";
import { getCustomer } from "@/api/customers";
import ShowCustomer from "@/components/customers/ShowCustomer";
import { PageHeader, Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useValidateToken } from "@/hooks/userData";

const Customer = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const [customer, setCustomer] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const customer = await getCustomer(params.id);

      if (!customer) {
        push(PAGES.NOT_FOUND.BASE);
        return;
      };

      setCustomer(customer);
      setIsLoading(false);
    };
    fetchData();
  }, [params.id, push]);

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
