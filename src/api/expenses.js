import { ENTITIES, IN_MS } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { CANCEL, PATHS, PAYMENTS } from "@/fetchUrls";
import { useQuery } from '@tanstack/react-query';
import { ATTRIBUTES, GET_EXPENSE_QUERY_KEY, LIST_EXPENSES_QUERY_KEY } from "../components/expenses/expenses.constants";
import { getInstance } from "./axios";
import { listItems, useCreateItem, useEditItem } from './common';

export function useListExpenses({ sort = 'name', order = true } = {}) {
  const query = useQuery({
    queryKey: [LIST_EXPENSES_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.EXPENSES,
      url: PATHS.EXPENSES,
      params: getDefaultListParams(ATTRIBUTES, sort, order)
    }),
    retry: false,
    staleTime: IN_MS.ONE_DAY,
  });

  return query;
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
  const createItem = useCreateItem();

  const createExpense = (expense) => {
    return createItem({
      entity: ENTITIES.EXPENSES,
      url: PATHS.EXPENSES,
      value: expense,
      responseEntity: ENTITIES.EXPENSE,
      invalidateQueries: [[LIST_EXPENSES_QUERY_KEY]],
    });
  };
  return createExpense;
};

export const useEditExpense = () => {
  const editItem = useEditItem();

  const editExpense = (expense) => {
    return editItem({
      entity: ENTITIES.EXPENSES,
      url: `${PATHS.EXPENSES}/${expense.id}`,
      value: expense,
      responseEntity: ENTITIES.EXPENSE,
      invalidateQueries: [[LIST_EXPENSES_QUERY_KEY], [GET_EXPENSE_QUERY_KEY, expense.id]]
    });
  };
  return editExpense;
};

export const useUpdatePayments = () => {
  const editItem = useEditItem();

  const updatePayments = async ({ expense, id }) => {
    const { paymentsMade, updatedAt } = expense;

    const response = await editItem({
      entity: ENTITIES.EXPENSES,
      url: `${PATHS.EXPENSES}/${id}/${PAYMENTS}`,
      value: { paymentsMade, updatedAt },
      responseEntity: ENTITIES.EXPENSE,
      invalidateQueries: [[LIST_EXPENSES_QUERY_KEY], [GET_EXPENSE_QUERY_KEY, expense.id]]
    });

    return response;
  };

  return updatePayments;
};

export const useCancelExpense = () => {
  const editItem = useEditItem();

  const cancelExpense = async ({ cancelData, id }) => {

    const response = await editItem({
      entity: ENTITIES.EXPENSES,
      url: `${PATHS.EXPENSES}/${id}/${CANCEL}`,
      value: cancelData,
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[LIST_EXPENSES_QUERY_KEY], [GET_EXPENSE_QUERY_KEY, id]]
    });

    return response;
  };

  return cancelExpense;
};
