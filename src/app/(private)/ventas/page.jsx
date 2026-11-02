"use client";
import { getBudgetListState, usePagedBudgets } from "@/api/budgets";
import { useRefreshServerList } from "@/api/pagedLists";
import { useGetSetting } from "@/api/settings";
import { COLORS, DATE_FORMATS, ENTITIES, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { getDateWithOffset } from "@/common/utils/dates";
import { formatLastCount } from "@/common/utils/pluralization";
import ServerBudgetsPage from "@/components/budgets/ServerBudgetsPage";
import { BUDGETS_FILTERS_KEY, BUDGET_SORT_FIELDS, SALES_FILTERS, BUDGET_STATES, DEFAULT_DATE_RANGE_VALUE } from "@/components/budgets/budgets.constants";
import { useBreadcrumContext } from "@/components/layout";
import { useKeyboardShortcuts } from "@/hooks";
import useServerListFilters from "@/hooks/useServerListFilters";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";

const Budgets = () => {
  const settings = useGetSetting(ENTITIES.BUDGET);
  const { refetch: refetchSettings } = settings;
  const hasSettings = settings.isSuccess && !settings.isPlaceholderData;
  const settingsReady = hasSettings && !settings.isFetching;
  const rangeValue = hasSettings
    ? Number(settings.data?.defaultPageDateRange?.value) || DEFAULT_DATE_RANGE_VALUE : null;
  const startDate = useMemo(() => rangeValue === null ? undefined : getDateWithOffset({
    offset: -rangeValue, unit: "month", format: DATE_FORMATS.ISO,
  }), [rangeValue]);
  const refreshList = useRefreshServerList(ENTITIES.BUDGETS);
  const applyList = useCallback((state) => refreshList(getBudgetListState(state, { startDate, settingsReady })),
    [refreshList, startDate, settingsReady]);
  const list = useServerListFilters({
    key: BUDGETS_FILTERS_KEY, defaultFilters: SALES_FILTERS, sortFields: BUDGET_SORT_FIELDS, onApply: applyList,
  });
  const requestState = getBudgetListState(list, { startDate, settingsReady });
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
    if (!settingsReady) { setLabels([]); return; }
    setLabels([{
      name: PAGES.BUDGETS.NAME,
      label: {
        title: formatLastCount(rangeValue, "month"), color: COLORS.BLUE,
        popup: <>Para ver el historial completo de Ventas haga click en <b>Historial</b></>,
      },
    }]);
  }, [setLabels, settingsReady, rangeValue]);

  const budgets = useMemo(() => (data?.items ?? []).map((budget) => ({
    ...budget,
    href: budget.state === BUDGET_STATES.DRAFT.id ? PAGES.BUDGETS.DRAFT(budget.id) : PAGES.BUDGETS.SHOW(budget.id),
  })), [data]);
  const sideActions = useMemo(() => [
    { id: 1, icon: ICONS.ADD, color: COLORS.GREEN, href: PAGES.BUDGETS.CREATE, text: "Crear venta" },
    { id: 2, icon: ICONS.HISTORY, color: COLORS.BLUE, href: PAGES.BUDGETS_HISTORY.BASE, text: "Historial de ventas" },
    {
      id: "update", icon: ICONS.REFRESH, color: COLORS.BLUE, text: "Actualizar ventas",
      onClick: hasSettings ? list.refresh : () => refetchSettings(),
      disabled: !hydrated || settings.isFetching || isFetching,
    },
    {
      id: "download-excel", icon: ICONS.FILE_EXCEL, color: COLORS.BLUE, text: "Descargar ventas en Excel",
      disabled: true, tooltip: "La exportación completa no está disponible por el momento.",
      showTooltipWhenExpanded: true,
    },
  ], [hasSettings, list.refresh, refetchSettings, hydrated, settings.isFetching, isFetching]);
  const actions = useMemo(() => [{
    id: 1, icon: ICONS.COPY, color: COLORS.GREEN,
    onClick: (budget) => push(PAGES.BUDGETS.CLONE(budget.id)), tooltip: "Clonar",
  }], [push]);
  useKeyboardShortcuts(() => push(PAGES.BUDGETS.CREATE), SHORTKEYS.ENTER);

  return <ServerBudgetsPage
    budgets={budgets} list={{ ...list, hydrated: requestState.hydrated,
      appliedCount: Object.keys(requestState.appliedFilters).filter((key) => key !== "startDate").length }} total={total}
    isLoading={!hydrated || settings.isFetching || isFetching} sideActions={sideActions} actions={actions}
  />;
};

export default Budgets;
