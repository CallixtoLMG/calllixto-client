"use client";
import { useListBudgetsHistory } from "@/api/budgets";
import BudgetsHistoryFilter from "@/components/budgets/BudgetsHistoryFilters";
import BudgetsPage from "@/components/budgets/BudgetsPage";
import { BUDGETS_HISTORY_FILTERS_KEY } from "@/components/budgets/budgets.constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useValidateToken } from "@/hooks";
import { useEffect, useMemo, useState } from "react";

const BudgetsHistory = () => {
  useValidateToken();
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  const { data, isLoading, refetch, isRefetching } = useListBudgetsHistory(
    {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }
  );

  const { setLabels } = useBreadcrumContext();
  const { setActions, setInfo } = useNavActionsContext();

  useEffect(() => {
    setLabels([{ name: "Historial de ventas" }]);
  }, [setLabels]);

  useEffect(() => {
    if (dateRange.startDate || dateRange.endDate) {
      refetch();
    }
  }, [dateRange, refetch]);

  const handleSearch = (newRange) => {
    setDateRange(newRange);
  };

  const budgets = useMemo(() => data, [data]);
  const loading = isLoading || isRefetching;

  useEffect(() => {
    setActions([]);
    setInfo(null);
  }, [loading, setActions, setInfo]);

  return (
    <>
      <BudgetsHistoryFilter onSearch={handleSearch} isLoading={loading} />
      {dateRange.startDate && dateRange.endDate && (
        <BudgetsPage
          isLoading={loading}
          budgets={loading ? [] : budgets}
          filterKey={BUDGETS_HISTORY_FILTERS_KEY}
         />
      )}
    </>
  );
};

export default BudgetsHistory;