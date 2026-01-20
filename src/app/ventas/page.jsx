"use client";
import { useListBudgets } from "@/api/budgets";
import { useGetSetting } from "@/api/settings";
import { useListUsers } from "@/api/users";
import { COLORS, ENTITIES, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import BudgetsPage from "@/components/budgets/BudgetsPage";
import { DEFAULT_DATE_RANGE_VALUE } from "@/components/budgets/budgets.constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useKeyboardShortcuts, useValidateToken } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Budgets = () => {
  useValidateToken();
  const { data: budgetsData, isLoading: isLoadingBudgets, isRefetching, refetch } = useListBudgets();
  const { data: usersData, isLoading: isLoadingUsers } = useListUsers();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();
  const { data: budgetsSettings, refetch: refetchSettings, isFetching: isFetchingSettings, } = useGetSetting(ENTITIES.BUDGET);
  const rangeValue = Number(budgetsSettings?.defaultPageDateRange?.value) || DEFAULT_DATE_RANGE_VALUE;

  useEffect(() => {
    if (isFetchingSettings) {
      setLabels([]);
      return;
    }
    setLabels([{
      name: PAGES.BUDGETS.NAME,
      label: {
        title: rangeValue === 1
          ? 'Último mes'
          : `Últimos ${rangeValue} meses`,
        color: COLORS.BLUE,
        popup: <>Para ver el historial completo de Ventas haga click en <b>Historial</b></>
      }
    }]);

  }, [setLabels, isFetchingSettings, rangeValue]);

  useEffect(() => {
    refetch()
    refetchSettings()
  }, [refetch, refetchSettings]);

  const budgets = useMemo(() => budgetsData?.budgets, [budgetsData]);
  const users = useMemo(() => usersData?.users, [usersData]);
  const loading = useMemo(() => isLoadingBudgets || isRefetching || isLoadingUsers, [isLoadingBudgets, isRefetching, isLoadingUsers]);

  const usersOptions = useMemo(() => users?.map(user => ({
    ...user,
    key: user.username,
    value: `${user.firstName} ${user.lastName}`,
    text: `${user.firstName} ${user.lastName}`,
  })), [users]);

  useEffect(() => {
    const actions = [
      {
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: () => { push(PAGES.BUDGETS.CREATE) },
        text: 'Crear'
      },
      {
        id: 2,
        icon: ICONS.SEARCH,
        color: COLORS.BLUE,
        onClick: () => { push(PAGES.BUDGETS_HISTORY.BASE) },
        text: 'Historial'
      },
    ];
    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.BUDGETS.CREATE), SHORTKEYS.ENTER);

  return (
    <BudgetsPage onRefetch={refetch} isLoading={loading} budgets={loading ? [] : budgets} usersOptions={usersOptions} />
  )
};

export default Budgets;
