import { IN_MS } from "@/common/constants";
import {
  ANALYTICS_MOCK_STATES,
  ANALYTICS_QUERY_KEYS,
} from "@/components/analytics/analytics.constants";
import {
  buildEmptyMockSalesTimeseries,
  buildMockExpenseCategoryDetails,
  buildMockExpenses,
  buildMockOverview,
  buildMockProducts,
  buildMockSalesRanking,
  buildMockSalesTimeseries,
  emptyAnalyticsMockData,
} from "@/components/analytics/analytics.mock";
import { useQuery } from "@tanstack/react-query";

const MOCK_LATENCY_MS = 140;

const delay = (value) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_LATENCY_MS);
  });

const withRange = (payload, range, comparisonRange) => ({
  ...payload,
  range,
  ...(comparisonRange ? { comparisonRange } : {}),
});

const shouldUseEmpty = (state) => state === ANALYTICS_MOCK_STATES.EMPTY;
const shouldThrow = (state, section) =>
  state === ANALYTICS_MOCK_STATES.ERROR || state === section;

const createMockAnalyticsProvider = ({ mockState = ANALYTICS_MOCK_STATES.READY } = {}) => ({
  getOverview: ({ range, comparisonRange }) => {
    if (shouldThrow(mockState, "overviewError")) {
      throw new Error("No se pudo cargar el resumen de Analytics.");
    }

    const source = shouldUseEmpty(mockState)
      ? emptyAnalyticsMockData.overview
      : buildMockOverview({ range, comparisonRange });
    return delay(withRange(source, range, comparisonRange));
  },
  getSalesTimeseries: ({ range, groupBy }) => {
    if (shouldThrow(mockState, ANALYTICS_MOCK_STATES.SALES_ERROR)) {
      throw new Error("No se pudo cargar la evolucion de ventas.");
    }

    const source = shouldUseEmpty(mockState)
      ? buildEmptyMockSalesTimeseries({ range, groupBy })
      : buildMockSalesTimeseries({ range, groupBy });

    return delay({
      ...source,
      range,
      groupBy: source.groupBy,
    });
  },
  getTopProducts: ({ range, sortBy = "revenue" }) => {
    if (shouldThrow(mockState, ANALYTICS_MOCK_STATES.TOP_PRODUCTS_ERROR)) {
      throw new Error("No se pudo cargar el ranking de productos.");
    }

    const source = shouldUseEmpty(mockState)
      ? emptyAnalyticsMockData.products
      : buildMockProducts({ range, sortBy });

    return delay({
      ...source,
      range,
      sortBy,
    });
  },
  getSalesRanking: ({ range, dimension }) => {
    if (shouldThrow(mockState, ANALYTICS_MOCK_STATES.TOP_PRODUCTS_ERROR)) {
      throw new Error("No se pudo cargar el ranking de ventas.");
    }

    const source = shouldUseEmpty(mockState)
      ? {
        ...emptyAnalyticsMockData.salesRanking,
        dimension,
      }
      : buildMockSalesRanking({ range, dimension });

    return delay({
      ...source,
      range,
      dimension,
    });
  },
  getExpenses: ({ range }) => {
    if (shouldThrow(mockState, ANALYTICS_MOCK_STATES.EXPENSES_ERROR)) {
      throw new Error("No se pudo cargar el analisis de gastos.");
    }

    const source = shouldUseEmpty(mockState)
      ? emptyAnalyticsMockData.expenses
      : buildMockExpenses({ range });

    return delay({
      ...source,
      range,
    });
  },
  getExpenseCategoryDetails: ({ category, range }) => {
    if (shouldThrow(mockState, ANALYTICS_MOCK_STATES.EXPENSE_CATEGORY_DETAILS_ERROR)) {
      throw new Error("No se pudo cargar el detalle de gastos.");
    }

    return delay(buildMockExpenseCategoryDetails({ category, range }));
  },
});

const getAnalyticsProvider = ({ mockState }) => createMockAnalyticsProvider({ mockState });

const useAnalyticsQuery = ({ queryKey, queryFn, mockState, enabled = true }) => {
  const isForcedLoading = mockState === ANALYTICS_MOCK_STATES.LOADING;
  const query = useQuery({
    queryKey,
    queryFn,
    staleTime: IN_MS.FIVE_MINUTES,
    retry: false,
    enabled: enabled && !isForcedLoading,
  });

  return {
    ...query,
    isLoading: isForcedLoading || query.isLoading,
  };
};

export const useAnalyticsOverview = ({ range, comparisonRange, mockState }) => {
  const provider = getAnalyticsProvider({ mockState });

  return useAnalyticsQuery({
    mockState,
    queryKey: [ANALYTICS_QUERY_KEYS.OVERVIEW, range, comparisonRange, mockState],
    queryFn: () => provider.getOverview({ range, comparisonRange }),
  });
};

export const useAnalyticsSalesTimeseries = ({ range, groupBy, mockState }) => {
  const provider = getAnalyticsProvider({ mockState });

  return useAnalyticsQuery({
    mockState,
    queryKey: [ANALYTICS_QUERY_KEYS.SALES_TIMESERIES, range, groupBy, mockState],
    queryFn: () => provider.getSalesTimeseries({ range, groupBy }),
  });
};

export const useAnalyticsTopProducts = ({ range, sortBy = "revenue", mockState }) => {
  const provider = getAnalyticsProvider({ mockState });

  return useAnalyticsQuery({
    mockState,
    queryKey: [ANALYTICS_QUERY_KEYS.TOP_PRODUCTS, range, sortBy, mockState],
    queryFn: () => provider.getTopProducts({ range, sortBy }),
  });
};

export const useAnalyticsSalesRanking = ({ range, dimension, mockState }) => {
  const provider = getAnalyticsProvider({ mockState });

  return useAnalyticsQuery({
    mockState,
    queryKey: [ANALYTICS_QUERY_KEYS.SALES_RANKING, range, dimension, mockState],
    queryFn: () => provider.getSalesRanking({ range, dimension }),
  });
};

export const useAnalyticsExpenses = ({ range, mockState }) => {
  const provider = getAnalyticsProvider({ mockState });

  return useAnalyticsQuery({
    mockState,
    queryKey: [ANALYTICS_QUERY_KEYS.EXPENSES, range, mockState],
    queryFn: () => provider.getExpenses({ range }),
  });
};

export const useAnalyticsExpenseCategoryDetails = ({ category, range, mockState, enabled = true }) => {
  const provider = getAnalyticsProvider({ mockState });

  return useAnalyticsQuery({
    mockState,
    enabled: enabled && !!category,
    queryKey: [ANALYTICS_QUERY_KEYS.EXPENSE_CATEGORY_DETAILS, category, range, mockState],
    queryFn: () => provider.getExpenseCategoryDetails({ category, range }),
  });
};
