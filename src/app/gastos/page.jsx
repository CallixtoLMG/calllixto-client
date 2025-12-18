"use client";
import { useUserContext } from "@/User";
import { useListExpenses } from "@/api/expenses";
import { COLORS, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel } from "@/common/utils";
import ExpensesPage from "@/components/expenses/ExpensesPage";
import { EXPENSE_STATES } from "@/components/expenses/expenses.constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useKeyboardShortcuts, useValidateToken } from "@/hooks";
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
    setLabels([{ name: PAGES.EXPENSES.NAME }]);
    refetch();
  }, [setLabels, refetch]);

  const expenses = useMemo(() => data?.expenses, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  const handleDownloadExcel = useCallback((elements) => {
    if (!elements.length) return;
    const headers = ['ID', 'Nombre', 'Categorias', 'Monto', 'Estado', 'Comentarios'];
    const mappedExpenses = elements.map(expense => {
      const expenseState = EXPENSE_STATES[expense.state]?.singularTitle || expense.state;
      return [
        expense.id,
        expense.name,
        expense.categories?.map(cat => cat.name).join(', ') ?? '',
        expense.amount,
        expenseState,
        expense.comments,
      ];
    });
    downloadExcel([headers, ...mappedExpenses], "Lista de Gastos");
  }, []);

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
    setActions(actions);
  }, [push, role, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.EXPENSES.CREATE), SHORTKEYS.ENTER);

  return (
    <ExpensesPage
      onRefetch={refetch}
      isLoading={loading}
      expenses={loading ? [] : expenses}
      role={role}
      onDownloadExcel={handleDownloadExcel}
    />
  );
};

export default Expenses;