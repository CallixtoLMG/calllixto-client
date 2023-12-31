"use client";
import { edit, useGetCustomer } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { PageHeader, Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useValidateToken } from "@/hooks/userData";
import { useAllowUpdate } from "@/hooks/allowUpdate";

const Customer = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { customer, isLoading } = useGetCustomer(params.id);
  const [allowUpdate, Toggle] = useAllowUpdate();

  if (!isLoading && !customer) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <>
      <PageHeader title="Cliente" />
      <Loader active={isLoading}>
        {Toggle}
        <CustomerForm customer={customer} onSubmit={edit} readonly={!allowUpdate} />
      </Loader>
    </>
  );
};

export default Customer;
