"use client";
import { edit, useGetCustomer } from "@/api/customers";
import CustomerForm from "@/components/customers/CustomerForm";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useValidateToken } from "@/hooks/userData";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useEffect } from "react";

const Customer = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { customer, isLoading } = useGetCustomer(params.id);
  const [allowUpdate, Toggle] = useAllowUpdate();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();

  useEffect(() => {
    resetActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Clientes', customer?.name]);
  }, [customer, setLabels]);

  if (!isLoading && !customer) {
    push(PAGES.NOT_FOUND.BASE);
    return;
  };

  return (
    <Loader active={isLoading}>
      {Toggle}
      <CustomerForm customer={customer} onSubmit={edit} readonly={!allowUpdate} />
    </Loader>
  );
};

export default Customer;
