"use client";
import { useUserContext } from "@/User";
import { getExpenseListState, usePagedExpenses } from "@/api/expenses";
import { useRefreshServerList } from "@/api/pagedLists";
import { COLORS, ENTITIES, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import ExpensesPage from "@/components/expenses/ExpensesPage";
import { EMPTY_FILTERS, EXPENSES_FILTERS_KEY, EXPENSE_SORT_FIELDS } from "@/components/expenses/expenses.constants";
import { useBreadcrumContext } from "@/components/layout";
import { useKeyboardShortcuts } from "@/hooks";
import useServerListFilters from "@/hooks/useServerListFilters";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";

const Expenses = () => {
  const refreshList = useRefreshServerList(ENTITIES.EXPENSES);
  const applyList = useCallback((state) => refreshList(getExpenseListState(state)), [refreshList]);
  const list = useServerListFilters({
    key: EXPENSES_FILTERS_KEY, defaultFilters: EMPTY_FILTERS, sortFields: EXPENSE_SORT_FIELDS, onApply: applyList,
  });
  const requestState = getExpenseListState(list);
  const { data, total, isFetching, error } = usePagedExpenses(requestState);
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { push } = useRouter();
  const { hydrated, pageNumber, pageSize, setPageNumber } = list;

  useEffect(() => {
    setLabels([{ name: PAGES.EXPENSES.NAME }]);
  }, [setLabels]);
  useEffect(() => {
    if (!hydrated || isFetching || total === null) return;
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    if (pageNumber > lastPage) setPageNumber(lastPage);
  }, [hydrated, isFetching, total, pageNumber, pageSize, setPageNumber]);
  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  const sideActions = useMemo(() => [
    ...(RULES.canCreate[role] ? [{
      id: 1, icon: ICONS.ADD, color: COLORS.GREEN,
      onClick: () => push(PAGES.EXPENSES.CREATE), text: "Crear gasto",
    }] : []),
    {
      id: "download-excel", icon: ICONS.FILE_EXCEL, color: COLORS.BLUE, text: "Descargar gastos en Excel",
      disabled: true, tooltip: "La exportación completa no está disponible por el momento.",
      showTooltipWhenExpanded: true,
    },
  ], [push, role]);

  useKeyboardShortcuts(() => push(PAGES.EXPENSES.CREATE), SHORTKEYS.ENTER);

  return <ExpensesPage
    isLoading={!hydrated || isFetching} expenses={data?.items ?? []}
    list={{ ...list, appliedCount: Object.keys(requestState.appliedFilters).length }} total={total} sideActions={sideActions}
  />;
};

export default Expenses;
