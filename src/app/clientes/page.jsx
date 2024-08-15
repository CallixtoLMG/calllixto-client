"use client";
import { useListAllCustomers, LIST_ALL_CUSTOMERS_QUERY_KEY } from "@/api/customers";
import CustomersPage from "@/components/customers/CustomersPage";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useRestoreEntity } from "@/hooks/common";
import { ENTITIES } from "@/constants";

const Customers = () => {
  useValidateToken();
  const { data, isLoading, isRefetching } = useListAllCustomers();
  const restoreEntity = useRestoreEntity({ entity: ENTITIES.CUSTOMERS, key: LIST_ALL_CUSTOMERS_QUERY_KEY });
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([PAGES.CUSTOMERS.NAME]);
  }, [setLabels]);

  const customers = useMemo(() => data?.customers, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  useEffect(() => {
    const handleRestore = async () => {
      await restoreEntity();
    };

    const actions = [
      {
        id: 1,
        icon: 'add',
        color: 'green',
        onClick: () => { push(PAGES.CUSTOMERS.CREATE) },
        text: 'Crear'
      },
      {
        id: 2,
        icon: 'undo',
        color: 'grey',
        onClick: handleRestore,
        text: 'Actualizar',
        disabled: loading
      },
    ];
    setActions(actions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.CUSTOMERS.CREATE), SHORTKEYS.ENTER);

  return (
    <CustomersPage isLoading={loading} customers={loading ? [] : customers} />
  );
};

export default Customers;
