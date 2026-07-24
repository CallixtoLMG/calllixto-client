"use client";
import { useListBudgetsHistory } from "@/api/budgets";
import { useGetSetting } from "@/api/settings";
import { useListUsers } from "@/api/users";
import { BUTTON_TEXTS, COLORS, CONTENT_SIZES, ENTITIES, ICONS, INFO, PAGES } from "@/common/constants";
import BudgetsHistoryFilter from "@/components/budgets/BudgetsHistoryFilters";
import BudgetsPage, { downloadBudgetsExcel } from "@/components/budgets/BudgetsPage";
import { BASE_BUDGETS_HISTORY_RANGES, BUDGETS_HISTORY_FILTERS_KEY, BUDGET_STATES, DATE_RANGE_KEY, buildCustomHistoryRanges } from "@/components/budgets/budgets.constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import useFilterParams from "@/hooks/useFilterParams";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const BUDGETS_HISTORY_INFO = INFO.HELP.SECTIONS[ENTITIES.BUDGETS_HISTORY].LIST;

const BudgetsHistory = () => {
  const [hydrated, setHydrated] = useState(false);
  const [filteredBudgets, setFilteredBudgets] = useState([]);
  const filteredBudgetsRef = useRef([]);
  useEffect(() => setHydrated(true), []);

  const {
    filters: dateRange,
    setFilters: setDateRange,
  } = useFilterParams({
    key: DATE_RANGE_KEY,
    defaultParams: {
      startDate: null,
      endDate: null,
    },
  });

  const { data: budgetsData, isLoading: isLoadingBudgets, isRefetching, refetch: refetchBudgetsHistory } = useListBudgetsHistory({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });
  const { data: usersData, isLoading: isLoadingUsers } = useListUsers();
  const { setLabels } = useBreadcrumContext();
  const { setActions, setInfo } = useNavActionsContext();
  const { data: budgetsSettings } = useGetSetting(ENTITIES.BUDGET);

  const customPresets = useMemo(() => {
    const ranges = budgetsSettings?.historyDateRanges ?? [];
    return buildCustomHistoryRanges(ranges);
  }, [budgetsSettings]);

  const presets = useMemo(
    () => [...BASE_BUDGETS_HISTORY_RANGES, ...customPresets],
    [customPresets]
  );
  const budgets = useMemo(() => {
    if (!budgetsData) return [];

    return budgetsData.map(budget => ({
      ...budget,
      href:
        budget.state === BUDGET_STATES.DRAFT.id
          ? PAGES.BUDGETS.DRAFT(budget.id)
          : PAGES.BUDGETS.SHOW(budget.id),
    }));
  }, [budgetsData]);
  const users = useMemo(() => usersData?.users, [usersData]);
  const loading = useMemo(() => isLoadingBudgets || isLoadingUsers || isRefetching, [isLoadingBudgets, isLoadingUsers, isRefetching]);

  const usersOptions = useMemo(() => users?.map(user => ({
    ...user,
    key: user.username,
    value: `${user.firstName} ${user.lastName}`,
    text: `${user.firstName} ${user.lastName}`,
  })), [users]);

  useEffect(() => {
    filteredBudgetsRef.current = filteredBudgets;
  }, [filteredBudgets]);

  useEffect(() => {
    setLabels([{ name: "Historial de ventas" }]);
  }, [setLabels]);

  const hasAppliedDateRange = Boolean(dateRange.startDate && dateRange.endDate);
  const handleUpdateHistory = useCallback(() => {
    if (!hasAppliedDateRange || loading) return;

    refetchBudgetsHistory();
  }, [hasAppliedDateRange, loading, refetchBudgetsHistory]);

  const handleDownloadHistoryExcel = useCallback(() => {
    downloadBudgetsExcel(filteredBudgetsRef.current);
  }, []);

  const handleFilteredBudgetsChange = useCallback((nextFilteredBudgets) => {
    setFilteredBudgets((currentFilteredBudgets) => {
      const hasSameBudgets =
        currentFilteredBudgets.length === nextFilteredBudgets.length &&
        currentFilteredBudgets.every((budget, index) => budget === nextFilteredBudgets[index]);

      return hasSameBudgets ? currentFilteredBudgets : nextFilteredBudgets;
    });
  }, []);

  useEffect(() => {
    if (hasAppliedDateRange) return;

    setFilteredBudgets((currentFilteredBudgets) => (
      currentFilteredBudgets.length ? [] : currentFilteredBudgets
    ));
  }, [hasAppliedDateRange]);

  const historyActions = useMemo(() => [
    {
      id: "update-history",
      icon: ICONS.REFRESH,
      color: COLORS.BLUE,
      text: BUTTON_TEXTS.UPDATE,
      collapsedTooltip: "Actualizar historial de ventas",
      onClick: handleUpdateHistory,
      disabled: !hasAppliedDateRange || loading,
      loading,
    },
    {
      id: "download-excel",
      icon: ICONS.FILE_EXCEL,
      color: COLORS.BLUE,
      text: "Descargar excel",
      collapsedTooltip: "Descargar historial de ventas en Excel",
      onClick: handleDownloadHistoryExcel,
      width: CONTENT_SIZES.FIT,
      disabled: !hasAppliedDateRange || loading || !filteredBudgets.length,
    },
  ], [filteredBudgets.length, handleDownloadHistoryExcel, handleUpdateHistory, hasAppliedDateRange, loading]);

  useEffect(() => {
    setActions(historyActions);
    setInfo(BUDGETS_HISTORY_INFO);
  }, [historyActions, setActions, setInfo]);

  useEffect(() => () => {
    setActions([]);
    setInfo(null);
  }, [setActions, setInfo]);

  const handleSearch = useCallback((newRange) => {
    setDateRange(newRange);
  }, [setDateRange]);

  if (!hydrated) return null;

  return (
    <>
      <BudgetsHistoryFilter
        onSearch={handleSearch}
        isLoading={loading}
        defaultValues={dateRange}
        presets={presets}
      />
      {dateRange.startDate && dateRange.endDate && (
        <BudgetsPage
          isLoading={loading}
          budgets={loading ? [] : budgets}
          filterKey={BUDGETS_HISTORY_FILTERS_KEY}
          usersOptions={usersOptions}
          onRefetch={refetchBudgetsHistory}
          useSideActions
          onFilteredBudgetsChange={handleFilteredBudgetsChange}
        />
      )}
    </>
  );
};

export default BudgetsHistory;
