"use client"
import { edit, getCustomer } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { PageHeader, Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useValidateToken } from "@/hooks/userData";

const EditCustomer = ({ params }) => {
  const { push } = useRouter();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = useValidateToken();

  useEffect(() => {
    async function fetchData() {
      var requestOptions = {
        method: 'GET',
        redirect: 'follow',
        headers: {
          authorization: `Bearer ${token}`
        },
        cache: "no-store",
      };
      const data = await getCustomer(params.id, requestOptions);

      if (!data) {
        push(PAGES.NOT_FOUND.BASE);
        return;
      };

      setCustomer(data);
      setIsLoading(false);
    };

    fetchData();
  }, [params.id, push, token]);

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
