import { fetchCustomerBudgetsForExport, getCustomerBudgetListState, usePagedBudgets } from "@/api/budgets";
import { useRefreshServerList } from "@/api/pagedLists";
import { Flex } from "@/common/components/custom";
import { COLORS, ENTITIES, ICONS, PAGES } from "@/common/constants";
import { downloadExcel, getEntityExcelFileName } from "@/common/utils";
import { BUDGET_SORT_FIELDS, BUDGET_STATES } from "@/components/budgets/budgets.constants";
import { getBudgetsExcelRows } from "@/components/budgets/budgets.utils";
import { BASE_SALES_DATE_RANGES } from "@/components/budgets/salesDateRange";
import ServerBudgetsPage from "@/components/budgets/ServerBudgetsPage";
import useListExcelExport from "@/hooks/useListExcelExport";
import useServerListFilters from "@/hooks/useServerListFilters";
import { useCallback, useEffect, useMemo } from "react";

const DEFAULT_FILTERS = { id: "", createdBy: "", state: "", paymentStatus: "", startDate: "", endDate: "" };
const DATE_SORT_FIELDS = { date: BUDGET_SORT_FIELDS.date };

const CustomerBudgets = ({ customerId, customerName }) => {
  const refreshList = useRefreshServerList(ENTITIES.BUDGETS);
  const applyList = useCallback((state) => {
    const request = getCustomerBudgetListState(state, customerId);
    if (request.hydrated) refreshList(request);
  }, [customerId, refreshList]);
  const list = useServerListFilters({
    key: `customerBudgetsFilters:${customerId}`,
    defaultFilters: DEFAULT_FILTERS,
    sortFields: BUDGET_SORT_FIELDS,
    onApply: applyList,
  });
  const { appliedFilters, sort, order, hydrated, pageNumber, pageSize, setPageNumber, applyFilterGroup } = list;
  const request = useMemo(() => getCustomerBudgetListState({
    appliedFilters, sort, order, hydrated, pageNumber, pageSize,
  }, customerId), [appliedFilters, sort, order, hydrated, pageNumber, pageSize, customerId]);
  const { data, total, isFetching, error } = usePagedBudgets(request);
  const { isExporting, startExport } = useListExcelExport({
    entity: ENTITIES.BUDGETS,
    id: customerId,
    errorMessage: "No se pudieron exportar los presupuestos.",
    exportFile: async (state) => {
      const matches = await fetchCustomerBudgetsForExport(state);
      if (matches.length) {
        downloadExcel(getBudgetsExcelRows(matches), getEntityExcelFileName(ENTITIES.CUSTOMER, customerName, customerId));
      }
    },
  });
  const exportDisabled = !request.hydrated || isFetching || !!error || !(total > 0) || isExporting;
  const exportTooltip = error ? "No se pudieron cargar los presupuestos."
    : total === 0 ? "No hay presupuestos para descargar." : undefined;
  const sideActions = useMemo(() => [{
    id: "download-excel",
    icon: ICONS.FILE_EXCEL,
    color: COLORS.BLUE,
    text: "Descargar Excel",
    disabled: exportDisabled,
    loading: isExporting,
    tooltip: exportTooltip,
    onClick: () => startExport(request),
  }], [exportDisabled, isExporting, exportTooltip, startExport, request]);
  const resetDates = () => applyFilterGroup({ startDate: "", endDate: "", presetRange: "" });
  const resetFilters = () => applyFilterGroup({ id: "", createdBy: "", state: "", paymentStatus: "" });

  useEffect(() => {
    if (!request.hydrated || isFetching || total === null) return;
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    if (pageNumber > lastPage) setPageNumber(lastPage);
  }, [request.hydrated, isFetching, total, pageNumber, pageSize, setPageNumber]);

  const budgetsList = useMemo(() => (data?.items ?? []).map((budget) => ({
    ...budget,
    href: budget.state === BUDGET_STATES.DRAFT.id ? PAGES.BUDGETS.DRAFT(budget.id) : PAGES.BUDGETS.SHOW(budget.id),
  })), [data]);

  const appliedCount = Object.keys(request.appliedFilters)
    .filter((key) => !["customerId", "startDate", "endDate"].includes(key)).length;

  return (
    <Flex $flexDirection="column" $rowGap="15px">
      <ServerBudgetsPage
        customerScoped
        budgetsList={budgetsList}
        list={{ ...list, sort: request.sort, onRestoreDates: resetDates,
          onRestoreFilters: resetFilters, appliedCount }}
        total={total}
        isLoading={!list.hydrated || isFetching}
        error={error}
        sideActions={sideActions}
        datePresets={BASE_SALES_DATE_RANGES}
        sortFields={request.appliedFilters.startDate ? DATE_SORT_FIELDS : BUDGET_SORT_FIELDS}
      />
    </Flex>
  );
};

export default CustomerBudgets;
