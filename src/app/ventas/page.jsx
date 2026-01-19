"use client";
import { useListBudgets } from "@/api/budgets";
import { useListUsers } from "@/api/users";
import { COLORS, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import BudgetsPage from "@/components/budgets/BudgetsPage";
import { BUDGETS_VIEW_MONTHS } from "@/components/budgets/budgets.constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { USER_STATES } from "@/components/users/users.constants";
import { useKeyboardShortcuts, useValidateToken } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Budgets = () => {
  useValidateToken();
  const { data: usersBudgets, isLoading: isLoadingBudgets, isRefetching, refetch } = useListBudgets();
  const { data: usersData, isLoading: isLoadingUsers } = useListUsers();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([{
      name: PAGES.BUDGETS.NAME, label: {
        title: `Últimos ${BUDGETS_VIEW_MONTHS} meses`,
        color: COLORS.BLUE,
        popup: <>Para ver el historial completo de Ventas haga click en <b>Historial</b></>
      }
    }]);
    refetch()
  }, [setLabels, refetch]);

  const budgets = useMemo(() => usersBudgets?.budgets, [usersBudgets]);
  const users = useMemo(() => usersData?.users, [usersData]);
  const loading = useMemo(() => isLoadingBudgets || isRefetching, [isLoadingBudgets, isRefetching]);

  const usersOptions = useMemo(() => users?.map(user => ({
    ...user,
    key: user.username,
    value: `${user.firstName} ${user.lastName}`,
    text: `${user.firstName} ${user.lastName}`,
  }))?.filter(({ state }) => state === USER_STATES.ACTIVE.id), [users]);
  
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
