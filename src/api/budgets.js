import { ATTRIBUTES } from "@/components/budgets/budgets.common";
import { ENTITIES, getDefaultListParams, TIME_IN_MS } from "@/constants";
import { CANCEL, CONFIRM, PATHS, PAYMENTS } from "@/fetchUrls";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';
import { listItems, useCreateItem, useEditItem } from "./common";

export const LIST_BUDGETS_QUERY_KEY = 'lisAllBudgets';
export const GET_BUDGET_QUERY_KEY = 'getBudget';

export function useListBudgets() {
  const query = useQuery({
    queryKey: [LIST_BUDGETS_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.BUDGETS,
      url: PATHS.BUDGETS,
      params: getDefaultListParams(ATTRIBUTES)
    }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
}

export function useGetBudget(id) {
  const getBudget = async (id) => {
    try {
      const { data } = await axios.get(`${PATHS.BUDGETS}/${id}`);
      return data?.budget;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_BUDGET_QUERY_KEY, id],
    queryFn: () => getBudget(id),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
    enabled: !!id,
  });

  return query;
};

export const useCreateBudget = () => {
  const createItem = useCreateItem();

  const createBudget = async (budget) => {
    const response = await createItem({
      entity: ENTITIES.BUDGETS,
      url: PATHS.BUDGETS,
      value: budget,
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[LIST_BUDGETS_QUERY_KEY]],
    });

    return response;
  };

  return createBudget;
};

export const useEditBudget = () => {
  const editItem = useEditItem();

  const editBudget = async (budget) => {

    const response = await editItem({
      entity: ENTITIES.BUDGETS,
      url: `${PATHS.BUDGETS}/${budget.id}`,
      value: budget,
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[LIST_BUDGETS_QUERY_KEY], [GET_BUDGET_QUERY_KEY, budget.id]]
    });

    return response;
  };

  return editBudget;
};

export const useConfirmBudget = () => {
  const editItem = useEditItem();

  const confirmBudget = async (budget, id) => {
    const response = await editItem({
      entity: ENTITIES.BUDGETS,
      url: `${PATHS.BUDGETS}/${id}/${CONFIRM}`,
      value: budget,
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[LIST_BUDGETS_QUERY_KEY], [GET_BUDGET_QUERY_KEY, id]]
    });
    return response;
  };

  return confirmBudget
};

export const useCancelBudget = () => {
  const editItem = useEditItem();

  const cancelBudget = async ({ cancelData, id }) => {

    const response = await editItem({
      entity: ENTITIES.BUDGETS,
      url: `${PATHS.BUDGETS}/${id}/${CANCEL}`,
      value: cancelData,
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[LIST_BUDGETS_QUERY_KEY], [GET_BUDGET_QUERY_KEY, id]]
    });

    return response;
  };

  return cancelBudget;
};

export const useUpdatePayments = () => {
  const editItem = useEditItem();

  const updatePayments = async ({ budget, id }) => {
    const { paymentsMade, updatedAt } = budget;

    const response = await editItem({
      entity: ENTITIES.BUDGETS,
      url: `${PATHS.BUDGETS}/${id}/${PAYMENTS}`,
      value: { paymentsMade, updatedAt },
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[LIST_BUDGETS_QUERY_KEY], [GET_BUDGET_QUERY_KEY, id]]
    });

    return response;
  };

  return updatePayments;
};
