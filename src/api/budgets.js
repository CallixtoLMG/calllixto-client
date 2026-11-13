import { ALL, ENTITIES, IN_MS } from "@/common/constants";
import { BUDGET_SORT_FIELDS, GET_BUDGET_QUERY_KEY } from "@/components/budgets/budgets.constants";
import { getBudgetDateRangeError } from "@/components/budgets/salesDateRange";
import { CANCEL, CONFIRM, PATHS, URL } from "@/fetchUrls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInstance } from './axios';
import { useCreateItem, useEditItem, usePatchItem } from "./common";
import { fetchAllListPages, invalidateServerLists, usePagedList } from "./pagedLists";

const getAppliedBudgetFilters = (applied) => {
  const filters = {
    id: applied.id,
    customerName: applied.customer,
    createdBy: applied.createdBy,
    state: applied.state,
    paymentStatus: applied.state === "CONFIRMED" ? applied.paymentStatus : "",
  };
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value && value !== ALL));
};

export const getBudgetListState = (state, { settingsReady }) => {
  const applied = state.appliedFilters;
  return {
    ...state,
    appliedFilters: {
      ...getAppliedBudgetFilters(applied),
      startDate: applied.startDate,
      endDate: applied.endDate,
    },
    hydrated: state.hydrated && settingsReady && !getBudgetDateRangeError(applied),
  };
};

export const getCustomerBudgetListState = (state, customerId) => {
  const { id, createdBy, state: budgetState, paymentStatus, startDate, endDate } = state.appliedFilters;
  const hasDateFilter = Boolean(startDate || endDate);
  return {
    ...state,
    appliedFilters: {
      ...getAppliedBudgetFilters({ id, createdBy, state: budgetState, paymentStatus }),
      customerId,
      ...(hasDateFilter && { startDate, endDate }),
    },
    // The API only applies a date range when sorting by createdAt.
    sort: hasDateFilter ? BUDGET_SORT_FIELDS.date : state.sort,
    hydrated: state.hydrated && !!customerId && (!hasDateFilter || !getBudgetDateRangeError({ startDate, endDate })),
  };
};

export const usePagedBudgets = (state) => usePagedList({ ...state, entity: ENTITIES.BUDGETS, url: PATHS.BUDGETS });

export const fetchBudgetsForExport = async ({ appliedFilters, sort, order }) => {
  const budgetsList = await fetchAllListPages({
    entity: ENTITIES.BUDGETS, url: PATHS.BUDGETS,
    filters: { ...appliedFilters, includeProducts: true }, sort, order,
  });
  if (budgetsList.some((budget) => !Array.isArray(budget.products))) {
    throw new Error("El servidor no devolvió los productos de todos los presupuestos.");
  }
  return budgetsList;
};

export const fetchCustomerBudgetsForExport = async (state) => {
  const { customerId } = state.appliedFilters;
  if (!customerId) throw new Error("Falta el ID del cliente.");

  const budgetsList = await fetchBudgetsForExport(state);
  if (budgetsList.some((budget) => budget.customer?.id !== customerId)) {
    throw new Error("El listado devolvió presupuestos de otro cliente.");
  }
  return budgetsList;
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
      skipStorageUpdate: true,
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
      invalidateQueries: [[GET_BUDGET_QUERY_KEY, budget.id]],
      skipStorageUpdate: true,
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
      invalidateQueries: [[GET_BUDGET_QUERY_KEY, id]],
      skipStorageUpdate: true,
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
      ],
      skipStorageUpdate: true,
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
