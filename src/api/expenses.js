import { ALL, DEFAULT_PAGE_SIZE, ENTITIES, IN_MS } from "@/common/constants";
import { CANCEL, PATHS } from "@/fetchUrls";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GET_EXPENSE_QUERY_KEY } from "../components/expenses/expenses.constants";
import { getInstance } from "./axios";
import { useCreateItem, useEditItem } from './common';
import { fetchAllListPages, invalidateServerLists, usePagedList } from "./pagedLists";

export const getExpenseListState = (state) => {
  const { id, name, state: expenseState } = state.appliedFilters;
  return {
    ...state,
    appliedFilters: {
      ...(id && { id }),
      ...(name && { name }),
      ...(expenseState && expenseState !== ALL && { state: expenseState }),
    },
    order: state.order === "asc",
  };
};

export const usePagedExpenses = (state) => usePagedList({ ...state, entity: ENTITIES.EXPENSES, url: PATHS.EXPENSES });

export const fetchExpensesForExport = (state) => {
  const { appliedFilters, sort, order } = getExpenseListState(state);
  return fetchAllListPages({
    entity: ENTITIES.EXPENSES, url: PATHS.EXPENSES, filters: appliedFilters, sort, order, pageSize: DEFAULT_PAGE_SIZE,
  });
};

export function useGetExpense(id) {
  const getExpense = async (id) => {
    try {
      const { data } = await getInstance().get(`${PATHS.EXPENSES}/${id}`);
      return data?.expense ?? null;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_EXPENSE_QUERY_KEY, id],
    queryFn: () => getExpense(id),
    retry: false,
    staleTime: IN_MS.ONE_HOUR,
    enabled: !!id,
  });

  return query;
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const createItem = useCreateItem();

  const createExpense = async (expense) => {
    const response = await createItem({
      entity: ENTITIES.EXPENSES,
      skipStorageUpdate: true,
      url: PATHS.EXPENSES,
      value: expense,
      responseEntity: ENTITIES.EXPENSE,
    });
    if (response?.statusOk) await invalidateServerLists(queryClient, ENTITIES.EXPENSES);
    return response;
  };
  return createExpense;
};

export const useEditExpense = () => {
  const queryClient = useQueryClient();
  const editItem = useEditItem();

  const editExpense = async (expense) => {
    const response = await editItem({
      entity: ENTITIES.EXPENSES,
      skipStorageUpdate: true,
      url: `${PATHS.EXPENSES}/${expense.id}`,
      value: expense,
      responseEntity: ENTITIES.EXPENSE,
      invalidateQueries: [[GET_EXPENSE_QUERY_KEY, expense.id]]
    });
    if (response?.statusOk) await invalidateServerLists(queryClient, ENTITIES.EXPENSES);
    return response;
  };
  return editExpense;
};

export const useCancelExpense = () => {
  const queryClient = useQueryClient();
  const editItem = useEditItem();

  const cancelExpense = async ({ cancelData, id }) => {

    const response = await editItem({
      entity: ENTITIES.EXPENSES,
      skipStorageUpdate: true,
      url: `${PATHS.EXPENSES}/${id}/${CANCEL}`,
      value: cancelData,
      responseEntity: ENTITIES.EXPENSE,
      invalidateQueries: [[GET_EXPENSE_QUERY_KEY, id]]
    });

    if (response?.statusOk) await invalidateServerLists(queryClient, ENTITIES.EXPENSES);
    return response;
  };

  return cancelExpense;
};
