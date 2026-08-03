import { DATE_FORMATS, ENTITIES, IN_MS } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { getDateWithOffset } from "@/common/utils/dates";
import { GET_BUDGET_QUERY_KEY, LIST_ATTRIBUTES, LIST_BUDGETS_HISTORY_QUERY_KEY, LIST_BUDGETS_QUERY_KEY } from "@/components/budgets/budgets.constants";
import { CANCEL, CONFIRM, PATHS, URL } from "@/fetchUrls";
import { useQuery } from "@tanstack/react-query";
import { getInstance } from './axios';
import { entityList, listItems, useCreateItem, useEditItem, usePatchItem } from "./common";

export function useListBudgets({ defaultPageDateRange, enabled = true } = {}) {
  return useQuery({
    queryKey: [
      LIST_BUDGETS_QUERY_KEY,
      defaultPageDateRange,
    ],
    queryFn: () =>
      listItems({
        entity: ENTITIES.BUDGETS,
        url: PATHS.BUDGETS,
        params: {
          ...getDefaultListParams(LIST_ATTRIBUTES),
          sort: "createdAt",
          startDate: getDateWithOffset({
            offset: -defaultPageDateRange,
            unit: "month",
            format: DATE_FORMATS.ISO,
          }),
        },
      }),
    staleTime: IN_MS.ONE_DAY,
    enabled
  });
};

export function useListBudgetsHistory({ startDate, endDate }) {
  return useQuery({
    queryKey: [LIST_BUDGETS_HISTORY_QUERY_KEY, JSON.stringify({ startDate, endDate })],
    queryFn: () => entityList({
      entity: ENTITIES.BUDGETS,
      url: PATHS.BUDGETS,
      params: {
        sort: 'createdAt',
        startDate,
        endDate
      }
    }),
    staleTime: IN_MS.ONE_DAY,
    enabled: !!startDate && !!endDate,
  });
};

export function useGetBudget(id) {
  const getBudget = async (id) => {
    try {
      const { data } = await getInstance().get(`${PATHS.BUDGETS}/${id}`);

      if (data?.budget) {
        return {
          ...data.budget,
          globalDiscount: data.budget.globalDiscount ?? 0,
          additionalCharge: data.budget.additionalCharge ?? 0
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_BUDGET_QUERY_KEY, id],
    queryFn: () => getBudget(id),
    retry: false,
    staleTime: IN_MS.FIVE_MINUTES,
    enabled: !!id,
  });

  return query;
};

export const useCreateBudget = () => {
  const createItem = useCreateItem();

  const createBudget = (budget) => {
    return createItem({
      entity: ENTITIES.BUDGETS,
      url: PATHS.BUDGETS,
      value: {
        ...budget,
        publicEnabled: true,
      },
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[LIST_BUDGETS_QUERY_KEY]],
    });
  };

  return createBudget;
};

export const getPublicBudget = async ({ accountId, publicHash }) => {
  if (!accountId || !publicHash) {
    const error = new Error("missing-public-budget-params");
    error.status = 400;
    throw error;
  }

  const baseUrl = `${URL}${encodeURIComponent(accountId)}`.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/${PATHS.BUDGETS}/public/${encodeURIComponent(publicHash)}`);

  if (response.status === 404) {
    const error = new Error("public-budget-not-found");
    error.status = 404;
    throw error;
  }

  if (!response.ok) {
    const error = new Error("public-budget-request-failed");
    error.status = response.status;
    throw error;
  }

  const data = await response.json();

  if (!data?.budget) {
    const error = new Error("invalid-public-budget-response");
    error.status = 502;
    throw error;
  }

  return {
    budget: {
      ...data.budget,
      globalDiscount: data.budget.globalDiscount ?? 0,
      additionalCharge: data.budget.additionalCharge ?? 0,
    },
    account: data.account,
    defaultsPDF: data.defaultsPDF ?? {},
  };
};

export const useEditBudget = () => {
  const editItem = useEditItem();

  const editBudget = (budget) => {
    return editItem({
      entity: ENTITIES.BUDGETS,
      url: `${PATHS.BUDGETS}/${budget.id}`,
      value: budget,
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[LIST_BUDGETS_QUERY_KEY], [GET_BUDGET_QUERY_KEY, budget.id]]
    });
  };

  return editBudget;
};

export const useConfirmBudget = () => {
  const editItem = useEditItem();

  const confirmBudget = (budget, id) => {
    return editItem({
      entity: ENTITIES.BUDGETS,
      url: `${PATHS.BUDGETS}/${id}/${CONFIRM}`,
      value: budget,
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[LIST_BUDGETS_QUERY_KEY], [GET_BUDGET_QUERY_KEY, id]]
    });
  };

  return confirmBudget
};

export const useConfirmBudgetDiscount = () => {
  const patchItem = usePatchItem();

  const confirmBudgetDiscount = ({ id, postConfirmDiscount }) => {
    return patchItem({
      entity: ENTITIES.BUDGETS,
      url: `${PATHS.BUDGETS}/${id}/confirmed`,
      value: {
        postConfirmDiscount,
      },
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [
        [LIST_BUDGETS_QUERY_KEY],
        [GET_BUDGET_QUERY_KEY, id]
      ]
    });
  };

  return confirmBudgetDiscount;
};


export const useCancelBudget = () => {
  const editItem = useEditItem();

  const cancelBudget = ({ cancelData, id }) => {
    return editItem({
      entity: ENTITIES.BUDGETS,
      url: `${PATHS.BUDGETS}/${id}/${CANCEL}`,
      value: cancelData,
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[LIST_BUDGETS_QUERY_KEY], [GET_BUDGET_QUERY_KEY, id]]
    });
  };

  return cancelBudget;
};
