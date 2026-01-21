"use client";
import { useListBudgetsHistory } from "@/api/budgets";
import { useGetSetting } from "@/api/settings";
import { useListUsers } from "@/api/users";
import { ENTITIES } from "@/common/constants";
import BudgetsHistoryFilter from "@/components/budgets/BudgetsHistoryFilters";
import BudgetsPage from "@/components/budgets/BudgetsPage";
import { BASE_BUDGETS_HISTORY_RANGES, BUDGETS_HISTORY_FILTERS_KEY, DATE_RANGE_KEY, buildCustomHistoryRanges } from "@/components/budgets/budgets.constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { USER_STATES } from "@/components/users/users.constants";
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

  const { data: budgetsData, isLoading: isLoadingBudgets, isRefetching } = useListBudgetsHistory({
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

  const budgets = useMemo(() => budgetsData ?? [], [budgetsData]);
  const users = useMemo(() => usersData?.users, [usersData]);
  const loading = useMemo(() => isLoadingBudgets || isLoadingUsers, [isLoadingBudgets, isLoadingUsers]);

  const usersOptions = useMemo(() => users?.map(user => ({
    ...user,
    key: user.username,
    value: `${user.firstName} ${user.lastName}`,
    text: `${user.firstName} ${user.lastName}`,
  }))?.filter(({ state }) => state === USER_STATES.ACTIVE.id), [users]);

  useEffect(() => {
    setLabels([{ name: "Historial de ventas" }]);
  }, [setLabels]);

  useEffect(() => {
    setActions([]);
    setInfo(null);
  }, [isLoadingBudgets, isRefetching, setActions, setInfo]);

  const handleSearch = (newRange) => {
    setDateRange(newRange);
  };

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
          usersOptions={usersOptions}
        />
      )}
    </>
  );
};

export default BudgetsHistory;
