import { ATTRIBUTES } from "@/components/expenses/expenses.common";
import { ACTIVE, ENTITIES, FILTERS_OPTIONS, getDefaultListParams, INACTIVE, TIME_IN_MS } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from '@tanstack/react-query';
import { getItemById, listItems, useActiveItem, useCreateItem, useDeleteItem, useEditItem, useInactiveItem } from './common';

export const GET_EXPENSE_QUERY_KEY = 'getExpense';
export const LIST_EXPENSES_QUERY_KEY = 'listExpenses';

export function useListExpenses({ sort = FILTERS_OPTIONS.NAME, order = true } = {}) {
  const query = useQuery({
    queryKey: [LIST_EXPENSES_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.EXPENSES,
      url: PATHS.EXPENSES,
      params: getDefaultListParams(ATTRIBUTES, sort, order)
    }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetExpense(id) {
  const query = useQuery({
    queryKey: [GET_EXPENSE_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: PATHS.EXPENSES, entity: ENTITIES.EXPENSES }),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};

export const useCreateExpense = () => {
  const createItem = useCreateItem();

  const createExpense = async (expense) => {
    const response = await createItem({
      entity: ENTITIES.EXPENSES,
      url: PATHS.EXPENSES,
      value: expense,
      responseEntity: ENTITIES.EXPENSE,
      invalidateQueries: [[LIST_EXPENSES_QUERY_KEY]],
    });

    return response;
  };

  return createExpense;
};

export const useDeleteExpense = () => {
  const deleteItem = useDeleteItem();

  const deleteExpense = async (id) => {
    const response = await deleteItem({
      entity: ENTITIES.EXPENSES,
      id,
      url: PATHS.EXPENSES,
      key: "id",
      invalidateQueries: [[LIST_EXPENSES_QUERY_KEY]]
    });

    return response;
  };

  return deleteExpense;
};

export const useEditExpense = () => {
  const editItem = useEditItem();

  const editExpense = async (expense) => {
    const response = await editItem({
      entity: ENTITIES.EXPENSES,
      url: `${PATHS.EXPENSES}/${expense.id}`,
      value: expense,
      key: "id",
      responseEntity: ENTITIES.EXPENSE,
      invalidateQueries: [[LIST_EXPENSES_QUERY_KEY], [GET_EXPENSE_QUERY_KEY, expense.id]]
    });

    return response;
  };

  return editExpense;
};

export const useInactiveExpense = () => {
  const inactiveItem = useInactiveItem();

  const inactiveExpense = async (expense, reason) => {
    const updatedExpense = {
      ...expense,
      inactiveReason: reason
    }

    const response = await inactiveItem({
      entity: ENTITIES.EXPENSES,
      url: `${PATHS.EXPENSES}/${expense.id}/${INACTIVE}`,
      value: updatedExpense,
      responseEntity: ENTITIES.EXPENSE,
      invalidateQueries: [[LIST_EXPENSES_QUERY_KEY], [GET_EXPENSE_QUERY_KEY, expense.id]]
    });

    return response;
  };

  return inactiveExpense;
};
export const useActiveExpense = () => {
  const activeItem = useActiveItem();

  const activeExpense = async (expense) => {
    const updatedExpense = {
      ...expense,
    }

    const response = await activeItem({
      entity: ENTITIES.EXPENSES,
      url: `${PATHS.EXPENSES}/${expense.id}/${ACTIVE}`,
      value: updatedExpense,
      responseEntity: ENTITIES.EXPENSE,
      invalidateQueries: [[LIST_EXPENSES_QUERY_KEY], [GET_EXPENSE_QUERY_KEY, expense.id]]
    });

    return response;
  };

  return activeExpense;
};

