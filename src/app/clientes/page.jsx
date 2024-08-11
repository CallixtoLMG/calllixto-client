"use client";
import { useListAllCustomers } from "@/api/customers";
import CustomersPage from "@/components/customers/CustomersPage";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Customers = () => {
  useValidateToken();
  const { data, isLoading } = useListAllCustomers();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([PAGES.CUSTOMERS.NAME]);
  }, [setLabels]);

  const { customers } = useMemo(() => {
    return { customers: data?.customers }
  }, [data]);

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

  useKeyboardShortcuts(() => push(PAGES.CUSTOMERS.CREATE), SHORTKEYS.ENTER);

  return (
    <CustomersPage isLoading={isLoading} customers={customers} />
  );
};

export default Customers;
