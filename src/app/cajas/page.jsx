"use client";
import { useUserContext } from "@/User";
import { useCreateCashBalance, useListCashBalances } from "@/api/cashBalances";
import { useGetSetting } from "@/api/settings";
import { ModalOpenTill } from "@/common/components/modals";
import { COLORS, ENTITIES, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel, mapToDropdownOptions } from "@/common/utils";
import CashBalancesPage from "@/components/cashBalances/CashBalancesPage";
import { CASH_BALANCE_STATES } from "@/components/cashBalances/cashBalances.constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useKeyboardShortcuts, useValidateToken } from "@/hooks";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const CashBalances = () => {
  useValidateToken();
  const { data, isLoading, isRefetching, refetch } = useListCashBalances();
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: paymentMethods } = useGetSetting(ENTITIES.GENERAL);
  const createCashBalance = useCreateCashBalance();
  useEffect(() => {
    setLabels([PAGES.CASH_BALANCES.NAME]);
    refetch();
  }, [setLabels, refetch]);

  const cashBalances = useMemo(() => data?.cashBalances, [data]);

  const { mutate, isPending } = useMutation({
    mutationFn: createCashBalance,
    onSuccess: async (response) => {
      if (response.statusOk) {
        toast.success('Caja creada correctamente!');
        push(PAGES.CASH_BALANCES.SHOW(response.cashBalance.id))
      } else {
        toast.error(response.error.message);
      }
    },
  });

  const loading = useMemo(() => isLoading || isRefetching || isPending, [isLoading, isRefetching, isPending]);

  const paymentMethodOptions = useMemo(() => {
    return mapToDropdownOptions(paymentMethods?.paymentMethods || []);
  }, [paymentMethods]);

  const handleDownloadExcel = useCallback((elements) => {
    if (!elements.length) return;
    const headers = ['ID', 'Estado', 'Fecha de inicio', 'Fecha de cierre', 'Métodos de pago', 'Monto inicial', 'Monto actual', 'Desgloce de Billetes (Inicio)', 'Desgloce de Billetes (Cierre)', 'Comentarios'];
    const mappedCashBalances = elements.map(cashBalance => {
      const cashBalanceState = CASH_BALANCE_STATES[cashBalance.state]?.singularTitle || cashBalance.state;

      const formattedBillsOnOpen = (cashBalance?.billsDetails || [])
        .map(bill => `$${bill.denomination} x ${bill.quantity}`)
        .join(', ');

      const formattedBillsOnClose = (cashBalance?.billsDetailsOnClose || [])
        .map(bill => `$${bill.denomination} x ${bill.quantity}`)
        .join(', ');

      return [
        cashBalance.id,
        cashBalanceState,
        cashBalance.startDate,
        cashBalance.closeDate,
        cashBalance.paymentMethods,
        cashBalance.initialAmount,
        cashBalance.currentAmount,
        formattedBillsOnOpen,
        formattedBillsOnClose,
        cashBalance.comments,
      ];
    });
    downloadExcel([headers, ...mappedCashBalances], "Lista de Cajas");
  }, []);

  useEffect(() => {
    const actions = [];
    if (RULES.canCreate[role]) {
      actions.push({
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: () => setIsModalOpen(true),
        text: 'Abrir',
      });
    }
    setActions(actions);
  }, [push, role, setActions, loading]);

  const handleConfirm = useCallback((data) => {
    const payload = {
      ...data,
      paymentMethods: data.allPaymentMethods
        ? null
        : data.paymentMethods.map((paymentMethod) => paymentMethod.value),
    };
    setIsModalOpen(false);
    mutate(payload);
  }, [mutate]);

  useKeyboardShortcuts(() => push(PAGES.CASH_BALANCES.CREATE), SHORTKEYS.ENTER);
  return (
    <>
      <CashBalancesPage
        onRefetch={refetch}
        isLoading={loading}
        cashBalances={isPending ? [] : cashBalances}
        paymentOptions={paymentMethodOptions}
        onDownloadExcel={handleDownloadExcel}
      />
      <ModalOpenTill
        open={isModalOpen}
        isLoading={loading}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleConfirm}
        paymentOptions={paymentMethodOptions}
      />
    </>
  );
};

export default CashBalances;
