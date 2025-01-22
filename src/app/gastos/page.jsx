"use client";
import { useUserContext } from "@/User";
import { useListExpenses } from "@/api/expenses";
import ExpensesPage from "@/components/expenses/ExpensesPage";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { COLORS, EXPENSE_STATES, ICONS, PAGES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

const Expenses = () => {
  useValidateToken();
  const { data, isLoading, isRefetching, refetch } = useListExpenses();
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([PAGES.EXPENSES.NAME]);
    refetch();
  }, [setLabels, refetch]);

  const expenses = useMemo(() => data?.expenses, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  const handleDownloadExcel = useCallback(() => {
    if (!expenses) return;
    const headers = ['ID', 'Nombre', 'Estado', 'Comentarios'];
    const mappedExpenses = expenses.map(expense => {
      const expenseState = EXPENSE_STATES[expense.state]?.singularTitle || expense.state;
      return [
        expense.id,
        expense.name,
        expenseState,
        expense.comments,
      ];
    });
    downloadExcel([headers, ...mappedExpenses], "Lista de Gastos");
  }, [expenses]);

  useEffect(() => {
    const actions = RULES.canCreate[role] ? [
      {
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: () => { push(PAGES.EXPENSES.CREATE) },
        text: 'Crear'
      }
    ] : [];
    actions.push({
      id: 3,
      icon: ICONS.FILE_EXCEL,
      color: COLORS.SOFT_GREY,
      onClick: handleDownloadExcel,
      text: 'Gastos',
      disabled: loading
    });
    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, role, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.EXPENSES.CREATE), SHORTKEYS.ENTER);

  return (
    <ExpensesPage
      onRefetch={refetch}
      isLoading={loading}
      expenses={loading ? [] : expenses}
      role={role}
    />
  );
};

export default Expenses;
