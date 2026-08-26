"use client";

import { PAGES } from "@/common/constants";
import { ANALYTICS_MOCK_STATES } from "@/components/analytics/analytics.constants";
import AnalyticsPage from "@/components/analytics/AnalyticsPage";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

const allowedMockStates = new Set(Object.values(ANALYTICS_MOCK_STATES));

const Analytics = () => {
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const searchParams = useSearchParams();
  const mockState = useMemo(() => {
    const requestedState = searchParams.get("analyticsMockState");

    return allowedMockStates.has(requestedState)
      ? requestedState
      : ANALYTICS_MOCK_STATES.READY;
  }, [searchParams]);

  useEffect(() => {
    setLabels([{ name: PAGES.ANALYTICS.NAME }]);
    setActions([]);
  }, [setActions, setLabels]);

  return <AnalyticsPage mockState={mockState} />;
};

export default Analytics;
