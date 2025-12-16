"use client";
import { useListCustomers } from "@/api/customers";
import { COLORS, ENTITIES, ICONS, INFO, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel, getFormatedPhone } from "@/common/utils";
import CustomersPage from "@/components/customers/CustomersPage";
import { CUSTOMER_STATES } from "@/components/customers/customers.constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useKeyboardShortcuts, useValidateToken } from "@/hooks";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

const Customers = () => {
  useValidateToken();
  const { data, isLoading, isRefetching, refetch } = useListCustomers();
  const { setLabels } = useBreadcrumContext();
  const { setActions, setInfo } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([{ name: PAGES.CUSTOMERS.NAME }]);
  }, [setLabels]);

  const customers = useMemo(() => data?.customers, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  const handleDownloadExcel = useCallback((elements) => {
    if (!elements?.length) return;
    const headers = ['Nombre', 'Estado', 'Dirección', 'Teléfono'];
    const mappedCustomers = elements.map(customer => {
      const customerState = CUSTOMER_STATES[customer.state]?.singularTitle || customer.state;
      return [
        customer.name,
        customerState,
        customer.addresses?.map(address => `${address.ref ? `${address.ref}: ` : ''}${address.address}`).join(' , '),
        customer.phoneNumbers?.map(phone => `${phone.ref ? `${phone.ref}: ` : ''}${getFormatedPhone(phone)}`).join(' , ')
      ];
    });
    downloadExcel([headers, ...mappedCustomers], "Lista de Clientes");
  }, []);

  useEffect(() => {
    const actions = [
      {
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: () => { push(PAGES.CUSTOMERS.CREATE) },
        text: 'Crear',
      }
    ];
    setActions(actions);
    setInfo(INFO.HELP.SECTIONS[ENTITIES.CUSTOMER]);
  }, [push, setActions, loading, setInfo]);

  useKeyboardShortcuts(() => push(PAGES.CUSTOMERS.CREATE), SHORTKEYS.ENTER);

  return (
    <CustomersPage onRefetch={refetch} isLoading={loading} customers={loading ? [] : customers} onDownloadExcel={handleDownloadExcel} />
  );
};

export default Customers;
