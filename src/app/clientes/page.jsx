"use client";
import { useListCustomers } from "@/api/customers";
import { usePaginationContext } from "@/components/common/table/Pagination";
import CustomersPage from "@/components/customers/CustomersPage";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Customers = () => {
  useValidateToken();
  const { data, isLoading } = useListCustomers({ sort: 'name', order: false });
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { handleEntityChange } = usePaginationContext();
  const { push } = useRouter();

  useEffect(() => {
    handleEntityChange("customers")
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
    <Loader active={isLoading}>
      <CustomersPage customers={customers} />
    </Loader>
  );
};

export default Customers;
