"use client";
import { useListBudgetsHistory } from "@/api/budgets";
import BudgetsHistoryFilter from "@/components/budgets/BudgetsHistoryFilters";
import BudgetsPage from "@/components/budgets/BudgetsPage";
import { BUDGETS_HISTORY_FILTERS_KEY, DATE_RANGE_KEY } from "@/components/budgets/budgets.constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useValidateToken } from "@/hooks";
import useFilterParams from "@/hooks/useFilterParams";
import { useEffect, useMemo } from "react";

const BudgetsHistory = () => {
  useValidateToken();

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

  useEffect(() => {
    setLabels([{ name: "Historial de ventas" }]);
  }, [setLabels]);

  const handleSearch = (newRange) => {
    setDateRange(newRange);
  };

  const budgets = useMemo(() => data ?? [], [data]);
  const loading = isLoading || isRefetching;

  useEffect(() => {
    setActions([]);
    setInfo(null);
  }, [loading, setActions, setInfo]);

  return (
    <>
      <BudgetsHistoryFilter
        onSearch={handleSearch}
        isLoading={loading}
        defaultValues={dateRange}
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
