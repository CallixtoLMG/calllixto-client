"use client";
import { useListBudgetsHistory } from "@/api/budgets";
import { useGetSetting } from "@/api/settings";
import { ENTITIES } from "@/common/constants";
import BudgetsHistoryFilter from "@/components/budgets/BudgetsHistoryFilters";
import BudgetsPage from "@/components/budgets/BudgetsPage";
import { BASE_BUDGETS_HISTORY_RANGES, BUDGETS_HISTORY_FILTERS_KEY, DATE_RANGE_KEY, buildCustomHistoryRanges } from "@/components/budgets/budgets.constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useValidateToken } from "@/hooks";
import useFilterParams from "@/hooks/useFilterParams";
import { useEffect, useMemo, useState } from "react";

const BudgetsHistory = () => {
  useValidateToken();

  const [hydrated, setHydrated] = useState(false);
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

  const {
    data,
    isLoading,
    isRefetching,
  } = useListBudgetsHistory({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

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

  useEffect(() => {
    setLabels([{ name: "Historial de ventas" }]);
  }, [setLabels]);

  useEffect(() => {
    setActions([]);
    setInfo(null);
  }, [isLoading, isRefetching, setActions, setInfo]);

  const handleSearch = (newRange) => {
    setDateRange(newRange);
  };

  const budgets = useMemo(() => data ?? [], [data]);
  const loading = isLoading || isRefetching;

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
          budgets={budgets}
          filterKey={BUDGETS_HISTORY_FILTERS_KEY}
        />
      )}
    </>
  );
};

export default BudgetsHistory;
