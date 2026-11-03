"use client";
import { getBudgetListState, usePagedBudgets } from "@/api/budgets";
import { useRefreshServerList } from "@/api/pagedLists";
import { useGetSetting } from "@/api/settings";
import { COLORS, ENTITIES, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import ServerBudgetsPage from "@/components/budgets/ServerBudgetsPage";
import { BUDGETS_FILTERS_KEY, BUDGET_SORT_FIELDS, SALES_FILTERS, BUDGET_STATES, DEFAULT_DATE_RANGE_VALUE } from "@/components/budgets/budgets.constants";
import { BASE_SALES_DATE_RANGES, buildSalesDateRanges, getAutomaticBudgetRange } from "@/components/budgets/salesDateRange";
import { useBreadcrumContext } from "@/components/layout";
import { useKeyboardShortcuts } from "@/hooks";
import useServerListFilters from "@/hooks/useServerListFilters";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "react-hot-toast";

const Budgets = () => {
  const settings = useGetSetting(ENTITIES.BUDGET);
  const hasSettings = settings.isSuccess && !settings.isPlaceholderData;
  const settingsReady = hasSettings && !settings.isFetching;
  const configuredMonths = Number(settings.data?.defaultPageDateRange?.value);
  const rangeValue = hasSettings
    ? (Number.isInteger(configuredMonths) && configuredMonths > 0 ? configuredMonths : DEFAULT_DATE_RANGE_VALUE) : null;
  // Only a new effective month value should replace a manual range.
  const appliedRangeSetting = useRef(null);
  const getDefaultFilters = useCallback(() => {
    appliedRangeSetting.current = rangeValue;
    return getAutomaticBudgetRange(rangeValue);
  }, [rangeValue]);
  const presets = useMemo(() => [
    ...BASE_SALES_DATE_RANGES, ...buildSalesDateRanges(settings.data?.historyDateRanges),
  ], [settings.data?.historyDateRanges]);
  const refreshList = useRefreshServerList(ENTITIES.BUDGETS);
  const applyList = useCallback((state) => {
    const request = getBudgetListState(state, { settingsReady });
    if (request.hydrated) refreshList(request);
  }, [refreshList, settingsReady]);
  const list = useServerListFilters({
    key: BUDGETS_FILTERS_KEY, defaultFilters: SALES_FILTERS, sortFields: BUDGET_SORT_FIELDS, onApply: applyList,
    ready: settingsReady, getDefaultFilters,
  });
  const { applyFilterGroup } = list;
  const resetDates = useCallback(() => {
    if (!settingsReady || !list.hydrated) return;
    applyFilterGroup({ ...getDefaultFilters(), presetRange: "" });
  }, [settingsReady, list.hydrated, applyFilterGroup, getDefaultFilters]);
  useEffect(() => {
    if (appliedRangeSetting.current !== rangeValue) resetDates();
  }, [rangeValue, resetDates]);
  const resetSaleFilters = useCallback(() => applyFilterGroup({
    id: "", customer: "", createdBy: "", state: "", paymentStatus: "",
  }), [applyFilterGroup]);
  const requestState = getBudgetListState(list, {
    settingsReady: settingsReady && appliedRangeSetting.current === rangeValue,
  });
  const { data, total, isFetching, error } = usePagedBudgets(requestState);
  const { setLabels } = useBreadcrumContext();
  const { push } = useRouter();
  const { hydrated, pageNumber, pageSize, setPageNumber } = list;

  useEffect(() => {
    if (!requestState.hydrated || isFetching || total === null) return;
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    if (pageNumber > lastPage) setPageNumber(lastPage);
  }, [requestState.hydrated, isFetching, total, pageNumber, pageSize, setPageNumber]);
  useEffect(() => {
    if (error || settings.error) toast.error((error || settings.error).message);
  }, [error, settings.error]);
  useEffect(() => {
    setLabels([{ name: PAGES.BUDGETS.NAME }]);
  }, [setLabels]);

  const budgets = useMemo(() => (data?.items ?? []).map((budget) => ({
    ...budget,
    href: budget.state === BUDGET_STATES.DRAFT.id ? PAGES.BUDGETS.DRAFT(budget.id) : PAGES.BUDGETS.SHOW(budget.id),
  })), [data]);
  const sideActions = useMemo(() => [
    { id: 1, icon: ICONS.ADD, color: COLORS.GREEN, href: PAGES.BUDGETS.CREATE, text: "Crear venta" },
    {
      id: "download-excel", icon: ICONS.FILE_EXCEL, color: COLORS.BLUE, text: "Descargar ventas en Excel",
      disabled: true, tooltip: "La exportación completa no está disponible por el momento.",
      showTooltipWhenExpanded: true,
    },
  ], []);
  const actions = useMemo(() => [{
    id: 1, icon: ICONS.COPY, color: COLORS.GREEN,
    onClick: (budget) => push(PAGES.BUDGETS.CLONE(budget.id)), tooltip: "Clonar",
  }], [push]);
  useKeyboardShortcuts(() => push(PAGES.BUDGETS.CREATE), SHORTKEYS.ENTER);

  return <ServerBudgetsPage
    budgets={budgets} list={{ ...list, hydrated: requestState.hydrated,
      onRestoreDates: resetDates, onRestoreFilters: resetSaleFilters,
      appliedCount: Object.keys(requestState.appliedFilters).filter((key) => !["startDate", "endDate"].includes(key)).length }} total={total}
    isLoading={!hydrated || settings.isFetching || isFetching} sideActions={sideActions} actions={actions}
    datePresets={presets}
  />;
};

export default Budgets;
