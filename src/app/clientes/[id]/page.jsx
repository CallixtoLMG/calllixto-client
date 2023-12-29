"use client";
import { useGetCustomer } from "@/api/customers";
import ShowCustomer from "@/components/customers/ShowCustomer";
import { PageHeader, Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useValidateToken } from "@/hooks/userData";

const Customer = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { customer, isLoading } = useGetCustomer(params.id)

  if (!isLoading && !customer) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

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
