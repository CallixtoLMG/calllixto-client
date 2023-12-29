"use client"
import { edit, getCustomer } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { PageHeader, Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useValidateToken } from "@/hooks/userData";

const EditCustomer = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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
      <PageHeader title="Actualizar Cliente" />
      <Loader active={isLoading}>
        <CustomerForm customer={customer} onSubmit={edit} />
      </Loader>
    </>
  )
};

export default EditCustomer;
