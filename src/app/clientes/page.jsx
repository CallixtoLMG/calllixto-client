"use client";
import { useListCustomers } from "@/api/customers";
import CustomersPage from "@/components/customers/CustomersPage";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { COLORS, ICONS, PAGES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { downloadExcel, formatedSimplePhone } from "@/utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Customers = () => {
  useValidateToken();
  const { data, isLoading, isRefetching, refetch } = useListCustomers();
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
      customer.addresses?.map(address => `${address.ref ? `${address.ref}: ` : ''}${address.address}`).join(' , '),
      customer.phoneNumbers?.map(phone => `${phone.ref ? `${phone.ref}: ` : ''}${formatedSimplePhone(phone)}`).join(' , ')
    ]);

    return [headers, ...customerData];
  }, [customers]);

  useEffect(() => {

    const actions = [
      {
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: () => { push(PAGES.CUSTOMERS.CREATE) },
        text: 'Crear',
      },
      {
        id: 3,
        icon: ICONS.FILE_EXCEL,
        color: COLORS.SOFT_GREY,
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
    <CustomersPage onRefetch={refetch} isLoading={loading} customers={loading ? [] : customers} />
  );
};

export default Customers;
