"use client"
import { edit, useGetCustomer } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { PageHeader, Loader } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useValidateToken } from "@/hooks/userData";

const EditCustomer = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { customer, isLoading } = useGetCustomer(params.id);

  if (!isLoading && !customer) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

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
