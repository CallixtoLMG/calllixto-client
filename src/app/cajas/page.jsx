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
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  const paymentMethodOptions = useMemo(() => {
    return mapToDropdownOptions(paymentMethods?.paymentMethods || []);
  }, [paymentMethods]);

  const handleDownloadExcel = useCallback(() => {
    if (!cashBalances) return;
    const headers = ['ID', 'Estado', 'Fecha de inicio', 'Fecha de cierre', 'Métodos de pago', 'Monto inicial', 'Monto actual', 'Detalle de Billetes', 'Comentarios',];
    const mappedCashBalances = cashBalances.map(cashBalance => {
      const cashBalanceState = CASH_BALANCE_STATES[cashBalance.state]?.singularTitle || cashBalance.state;
      return [
        cashBalance.id,
        cashBalanceState,
        cashBalance.startDate,
        cashBalance.closeDate,
        cashBalance.paymentMethods,
        cashBalance.initialAmount,
        cashBalance.actualAmount,
        cashBalance.billsDetails,
        cashBalance.comments,
      ];
    });
    downloadExcel([headers, ...mappedCashBalances], "Lista de Cajas");
  }, [cashBalances]);

  useEffect(() => {
    const actions = [];

    if (RULES.canCreate[role]) {
      actions.push({
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: handleOpenModal,
        text: 'Abrir',
      });
    }

    actions.push({
      id: 2,
      icon: ICONS.FILE_EXCEL,
      onClick: handleDownloadExcel,
      text: 'Cajas',
      disabled: loading
    });

    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, role, setActions, loading]);

  const { mutate, isPending } = useMutation({
    mutationFn: createCashBalance,
    onSuccess: async (response) => {
      if (response.statusOk) {
        push(PAGES.CASH_BALANCES.SHOW(response.cashBalance.id))
        toast.success('Caja abierta!');
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleConfirm = useCallback((data) => {
    setIsModalOpen(false);
    mutate(data);
  }, [mutate]);

  useKeyboardShortcuts(() => push(PAGES.CASH_BALANCES.CREATE), SHORTKEYS.ENTER);
  return (
    <>
      <CashBalancesPage
        onRefetch={refetch}
        isLoading={isPending}
        cashBalances={isPending ? [] : cashBalances}
      />
      <ModalOpenTill
        open={isModalOpen}
        isLoading={isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleConfirm}
        paymentOptions={paymentMethodOptions}
      />
    </>
  );
};

export default CashBalances;
