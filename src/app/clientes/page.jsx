"use client";
import { useListCustomers } from "@/api/customers";
import { usePaginationContext } from "@/components/common/table/Pagination";
import CustomersPage from "@/components/customers/CustomersPage";
import { ATTRIBUTES } from "@/components/customers/customers.common";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { ENTITIES, PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Customers = () => {
  useValidateToken();
  const { data, isLoading } = useListCustomers({ attributes: [ATTRIBUTES.ID, ATTRIBUTES.NAME, ATTRIBUTES.ADDRESS, ATTRIBUTES.PHONE, ATTRIBUTES.COMMENT] });
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { handleEntityChange } = usePaginationContext();
  const { push } = useRouter();

  useEffect(() => {
    handleEntityChange(ENTITIES.CUSTOMERS)
  }, []);

  useEffect(() => {
    setLabels(['Clientes']);
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
  return (
    <CustomersPage isLoading={isLoading} customers={customers} />
  );
};

export default Customers;
