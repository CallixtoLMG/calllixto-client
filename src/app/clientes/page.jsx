"use client";
import { LIST_CUSTOMERS_QUERY_KEY, useListCustomers } from "@/api/customers";
import CustomersPage from "@/components/customers/CustomersPage";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { ENTITIES, PAGES, SHORTKEYS } from "@/constants";
import { useRestoreEntity } from "@/hooks/common";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { downloadExcel, formatedSimplePhone } from "@/utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Customers = () => {
  useValidateToken();
  const { data, isLoading, isRefetching } = useListCustomers();
  const restoreEntity = useRestoreEntity({ entity: ENTITIES.CUSTOMERS, key: LIST_CUSTOMERS_QUERY_KEY });
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([PAGES.CUSTOMERS.NAME]);
  }, [setLabels]);

  const customers = useMemo(() => data?.customers, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  const prepareCustomerDataForExcel = useMemo(() => {
    if (!customers) return [];  
    const headers = ['Nombre', 'Dirección', 'Teléfono'];

    const customerData = customers.map(customer => [
      customer.name,
      customer.addresses?.map(address => address.address).join(' , '),
      customer.phoneNumbers?.map(phone => formatedSimplePhone(phone)).join(' , ')
    ]);

    return [headers, ...customerData];
  }, [customers]);

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
        text: 'Crear',
      },
      {
        id: 2,
        icon: 'undo',
        color: 'grey',
        onClick: handleRestore,
        text: 'Actualizar',
        disabled: loading,
        width: "fit-content",
      },
      {
        id: 3,
        icon: 'file excel',
        color: 'gray',
        onClick: () => {
          downloadExcel(prepareCustomerDataForExcel, "Lista de Clientes");
        },
        text: 'Clientes',
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
