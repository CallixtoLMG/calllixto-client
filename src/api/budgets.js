import { ALL, ENTITIES, IN_MS } from "@/common/constants";
import { GET_BUDGET_QUERY_KEY, LIST_BUDGETS_HISTORY_QUERY_KEY } from "@/components/budgets/budgets.constants";
import { CANCEL, CONFIRM, PATHS, URL } from "@/fetchUrls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInstance } from './axios';
import { invalidateServerLists, usePagedList } from "./pagedLists";
import { entityList, useCreateItem, useEditItem, usePatchItem } from "./common";

export const getBudgetListState = (state, { startDate, settingsReady }) => {
  const applied = state.appliedFilters;
  const filters = {
    id: applied.id,
    customerName: applied.customer,
    createdBy: applied.createdBy,
    state: applied.state,
    paymentStatus: applied.state === "CONFIRMED" ? applied.paymentStatus : "",
  };
  return {
    ...state,
    appliedFilters: {
      ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value && value !== ALL)),
      startDate,
    },
    order: state.order === "asc",
    hydrated: state.hydrated && settingsReady,
  };
};

export const usePagedBudgets = (state) => usePagedList({ ...state, entity: ENTITIES.BUDGETS, url: PATHS.BUDGETS });

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
  const queryClient = useQueryClient();
  const createItem = useCreateItem();

  const createBudget = async (budget) => {
    const data = await createItem({
      entity: ENTITIES.BUDGETS,
      url: PATHS.BUDGETS,
      value: budget,
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [],
    });
    if (data?.statusOk) await invalidateServerLists(queryClient, ENTITIES.BUDGETS);
    return data;
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
  const queryClient = useQueryClient();
  const editItem = useEditItem();

  const editBudget = async (budget) => {
    const data = await editItem({
      entity: ENTITIES.BUDGETS,
      url: `${PATHS.BUDGETS}/${budget.id}`,
      value: budget,
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[GET_BUDGET_QUERY_KEY, budget.id]]
    });
    if (data?.statusOk) await invalidateServerLists(queryClient, ENTITIES.BUDGETS);
    return data;
  };

  return editBudget;
};

export const useConfirmBudget = () => {
  const queryClient = useQueryClient();
  const editItem = useEditItem();

  const confirmBudget = async (budget, id) => {
    const data = await editItem({
      entity: ENTITIES.BUDGETS,
      url: `${PATHS.BUDGETS}/${id}/${CONFIRM}`,
      value: budget,
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[GET_BUDGET_QUERY_KEY, id]]
    });
    if (data?.statusOk) await invalidateServerLists(queryClient, ENTITIES.BUDGETS);
    return data;
  };

  return confirmBudget
};

export const useConfirmBudgetDiscount = () => {
  const queryClient = useQueryClient();
  const patchItem = usePatchItem();

  const confirmBudgetDiscount = async ({ id, postConfirmDiscount }) => {
    const data = await patchItem({
      entity: ENTITIES.BUDGETS,
      url: `${PATHS.BUDGETS}/${id}/confirmed`,
      value: {
        postConfirmDiscount,
      },
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [
        [GET_BUDGET_QUERY_KEY, id]
      ]
    });
    if (data?.statusOk) await invalidateServerLists(queryClient, ENTITIES.BUDGETS);
    return data;
  };

  return confirmBudgetDiscount;
};


export const useCancelBudget = () => {
  const queryClient = useQueryClient();
  const editItem = useEditItem();

  const cancelBudget = async ({ cancelData, id }) => {
    const data = await editItem({
      entity: ENTITIES.BUDGETS,
      url: `${PATHS.BUDGETS}/${id}/${CANCEL}`,
      value: cancelData,
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[GET_BUDGET_QUERY_KEY, id]],
      skipStorageUpdate: true,
    });
    if (data?.statusOk) await invalidateServerLists(queryClient, ENTITIES.BUDGETS);
    return data;
  };

  return cancelBudget;
};
