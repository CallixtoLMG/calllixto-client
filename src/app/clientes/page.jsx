"use client";
import { useListCustomers } from "@/api/customers";
import CustomersPage from "@/components/customers/CustomersPage";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Customers = () => {
  useValidateToken();
  const { data: customers, isLoading } = useListCustomers();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels(['Clientes']);
  }, [setLabels]);

  useEffect(() => {
    const actions = [
      {
        id: 1,
        icon: 'add',
        color: 'green',
        onClick: () => { push(PAGES.CUSTOMERS.CREATE) },
        text: 'Crear'
      }
    ];
    setActions(actions);
  }, [push, setActions]);

  return (
    <Loader active={isLoading}>
      <CustomersPage customers={customers} />
    </Loader>
  );
};

export default Customers;
