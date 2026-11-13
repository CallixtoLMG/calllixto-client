"use client";
import { useUserContext } from "@/User";
import { fetchExpensesForExport, getExpenseListState, usePagedExpenses } from "@/api/expenses";
import { useRefreshServerList } from "@/api/pagedLists";
import { COLORS, ENTITIES, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel } from "@/common/utils";
import ExpensesPage from "@/components/expenses/ExpensesPage";
import { EMPTY_FILTERS, EXPENSES_FILTERS_KEY, EXPENSE_SORT_FIELDS, EXPENSE_STATES } from "@/components/expenses/expenses.constants";
import { useBreadcrumContext } from "@/components/layout";
import { useKeyboardShortcuts } from "@/hooks";
import useServerListFilters from "@/hooks/useServerListFilters";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const Expenses = () => {
  const refreshList = useRefreshServerList(ENTITIES.EXPENSES);
  const applyList = useCallback((state) => refreshList(getExpenseListState(state)), [refreshList]);
  const list = useServerListFilters({
    key: EXPENSES_FILTERS_KEY, defaultFilters: EMPTY_FILTERS, sortFields: EXPENSE_SORT_FIELDS, onApply: applyList,
  });
  const requestState = getExpenseListState(list);
  const { data, total, isFetching, error } = usePagedExpenses(requestState);
  const [isExporting, setIsExporting] = useState(false);
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { push } = useRouter();
  const { hydrated, pageNumber, pageSize, setPageNumber, appliedFilters, sort, order } = list;

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

  const exportDisabled = !hydrated || isFetching || !(total > 0) || isExporting;
  const handleDownloadExcel = useCallback(async () => {
    if (exportDisabled) return;
    setIsExporting(true);
    try {
      const expenses = await fetchExpensesForExport({ appliedFilters, sort, order });
      if (!expenses.length) return;
      const headers = ["ID", "Nombre", "Categorias", "Monto", "Estado", "Comentarios"];
      const rows = expenses.map((expense) => [
        expense.id,
        expense.name,
        expense.categories?.map((category) => category.name).join(", ") ?? "",
        expense.amount,
        EXPENSE_STATES[expense.state]?.singularTitle || expense.state,
        expense.comments,
      ]);
      downloadExcel([headers, ...rows], "Lista de Gastos");
    } catch (error) {
      toast.error(error.message || "No se pudieron exportar los gastos.");
    } finally {
      setIsExporting(false);
    }
  }, [appliedFilters, sort, order, exportDisabled]);

  const sideActions = useMemo(() => [
    ...(RULES.canCreate[role] ? [{
      id: 1, icon: ICONS.ADD, color: COLORS.GREEN,
      onClick: () => push(PAGES.EXPENSES.CREATE), text: "Crear gasto",
    }] : []),
    {
      id: "download-excel", icon: ICONS.FILE_EXCEL, color: COLORS.BLUE, text: "Descargar gastos en Excel",
      onClick: handleDownloadExcel, disabled: exportDisabled, loading: isExporting, showTooltipWhenExpanded: true,
    },
  ], [push, role, handleDownloadExcel, exportDisabled, isExporting]);

  useKeyboardShortcuts(() => push(PAGES.EXPENSES.CREATE), SHORTKEYS.ENTER);

  return <ExpensesPage
    isLoading={!hydrated || isFetching} expensesList={data?.items ?? []}
    list={{ ...list, appliedCount: Object.keys(requestState.appliedFilters).length }} total={total} sideActions={sideActions}
  />;
};

export default Expenses;
