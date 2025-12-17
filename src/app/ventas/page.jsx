"use client";
import { useListBudgets } from "@/api/budgets";
import { COLORS, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import BudgetsPage from "@/components/budgets/BudgetsPage";
import { BUDGETS_VIEW_MONTHS } from "@/components/budgets/budgets.constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useKeyboardShortcuts, useValidateToken } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const Budgets = () => {
  useValidateToken();
  const { data, isLoading, isRefetching, refetch } = useListBudgets();
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

  const budgets = useMemo(() => data?.budgets, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

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
    <BudgetsPage onRefetch={refetch} isLoading={loading} budgets={loading ? [] : budgets} />
  )
};

export default Budgets;
