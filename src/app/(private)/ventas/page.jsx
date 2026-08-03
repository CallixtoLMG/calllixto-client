"use client";
import { useListBudgets } from "@/api/budgets";
import { useGetSetting } from "@/api/settings";
import { useListUsers } from "@/api/users";
import { COLORS, ENTITIES, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { formatLastCount } from "@/common/utils/pluralization";
import BudgetsPage from "@/components/budgets/BudgetsPage";
import { BUDGET_STATES, DEFAULT_DATE_RANGE_VALUE } from "@/components/budgets/budgets.constants";
import { useBreadcrumContext } from "@/components/layout";
import { useKeyboardShortcuts } from "@/hooks";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

const Budgets = () => {
  const { data: usersData, isLoading: isLoadingUsers } = useListUsers();
  const { setLabels } = useBreadcrumContext();
  const { push } = useRouter();
  const pushRef = useRef(push);
  const { data: budgetsSettings, refetch: refetchSettings, isFetching: isFetchingSettings, } = useGetSetting(ENTITIES.BUDGET);
  const rangeValue = Number(budgetsSettings?.defaultPageDateRange?.value) || DEFAULT_DATE_RANGE_VALUE;
  const { data: budgetsData, isLoading: isLoadingBudgets, isRefetching, refetch } = useListBudgets({
    defaultPageDateRange: rangeValue,
    enabled: !!rangeValue,
  });

  useEffect(() => {
    if (isFetchingSettings) {
      setLabels([]);
      return;
    }
    setLabels([{
      name: PAGES.BUDGETS.NAME,
      label: {
        title: formatLastCount(rangeValue, "month"),
        color: COLORS.BLUE,
        popup: <>Para ver el historial completo de Ventas haga click en <b>Historial</b></>
      }
    }]);

  }, [setLabels, isFetchingSettings, rangeValue]);

  useEffect(() => {
    refetch()
    refetchSettings()
  }, [refetch, refetchSettings]);

  const budgets = useMemo(() => {
    if (!budgetsData?.budgets) return [];

    return budgetsData.budgets.map(budget => ({
      ...budget,
      href:
        budget.state === BUDGET_STATES.DRAFT.id
          ? PAGES.BUDGETS.DRAFT(budget.id)
          : PAGES.BUDGETS.SHOW(budget.id),
    }));
  }, [budgetsData]);

  const users = useMemo(() => usersData?.users, [usersData]);
  const loading = useMemo(() => isLoadingBudgets || isRefetching || isLoadingUsers, [isLoadingBudgets, isRefetching, isLoadingUsers]);

  const usersOptions = useMemo(() => users?.map(user => ({
    ...user,
    key: user.username,
    value: `${user.firstName} ${user.lastName}`,
    text: `${user.firstName} ${user.lastName}`,
  })), [users]);

  useEffect(() => {
    pushRef.current = push;
  }, [push]);

  const handleCreate = useCallback(() => {
    pushRef.current(PAGES.BUDGETS.CREATE);
  }, []);

  const handleHistory = useCallback(() => {
    pushRef.current(PAGES.BUDGETS_HISTORY.BASE);
  }, []);

  const sideActions = useMemo(() => (
    [
      {
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: handleCreate,
        text: 'Crear',
        collapsedTooltip: 'Crear venta',
      },
      {
        id: 2,
        icon: ICONS.SEARCH,
        color: COLORS.BLUE,
        onClick: handleHistory,
        text: 'Historial',
        collapsedTooltip: 'Ir al historial de ventas',
      },
    ]
  ), [handleCreate, handleHistory]);

  useKeyboardShortcuts(() => push(PAGES.BUDGETS.CREATE), SHORTKEYS.ENTER);

  return (
    <BudgetsPage
      onRefetch={refetch}
      isLoading={loading}
      budgets={loading ? [] : budgets}
      usersOptions={usersOptions}
      sideActions={sideActions}
    />
  )
};

export default Budgets;
