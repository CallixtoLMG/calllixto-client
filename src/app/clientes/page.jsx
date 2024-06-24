"use client";
import { useListCustomers } from "@/api/customers";
import { usePaginationContext } from "@/components/common/table/Pagination";
import CustomersPage from "@/components/customers/CustomersPage";
import { ATTRIBUTES } from "@/components/customers/customers.common";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { ENTITIES, PAGES, SHORTKEY } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Customers = () => {
  useValidateToken();
  const { data, isLoading } = useListCustomers({ attributes: [ATTRIBUTES.ID, ATTRIBUTES.NAME, ATTRIBUTES.ADDRESSES, ATTRIBUTES.PHONES, ATTRIBUTES.EMAILS,  ATTRIBUTES.COMMENT] });
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { handleEntityChange } = usePaginationContext();
  const { push } = useRouter();

  useEffect(() => {
    handleEntityChange(ENTITIES.CUSTOMERS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useKeyboardShortcuts(() => push(PAGES.CUSTOMERS.CREATE), SHORTKEY.ENTER);

  return (
    <CustomersPage isLoading={isLoading} customers={customers} />
  );
};

export default Customers;
