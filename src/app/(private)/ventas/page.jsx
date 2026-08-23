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
import { useEffect, useMemo } from "react";

const Budgets = () => {
  const { data: usersData, isLoading: isLoadingUsers } = useListUsers();
  const { setLabels } = useBreadcrumContext();
  const { push } = useRouter();
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

  const sideActions = useMemo(() => (
    [
      {
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        href: PAGES.BUDGETS.CREATE,
        text: 'Crear venta',
      },
      {
        id: 2,
        icon: ICONS.HISTORY,
        color: COLORS.BLUE,
        href: PAGES.BUDGETS_HISTORY.BASE,
        text: 'Historial de ventas',
      },
    ]
  ), []);

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
