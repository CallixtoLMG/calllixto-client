import { ENTITIES, IN_MS } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { LIST_ATTRIBUTES, GET_BUDGET_QUERY_KEY, LIST_BUDGETS_QUERY_KEY } from "@/components/budgets/budgets.constants";
import { CANCEL, CONFIRM, PATHS, PAYMENTS } from "@/fetchUrls";
import { useQuery } from "@tanstack/react-query";
import { getInstance } from './axios';
import { listItems, useCreateItem, useEditItem } from "./common";

export function useListBudgets() {
  const query = useQuery({
    queryKey: [LIST_BUDGETS_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.BUDGETS,
      url: PATHS.BUDGETS,
      params: getDefaultListParams(LIST_ATTRIBUTES)
    }),
    staleTime: IN_MS.ONE_DAY,
  });

  return query;
}

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
      value: budget,
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[LIST_BUDGETS_QUERY_KEY]],
    });
  };

  return createBudget;
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

export const useUpdatePayments = () => {
  const editItem = useEditItem();

  const updatePayments = async ({ budget: { paymentsMade, updatedAt }, id }) => {
    return editItem({
      entity: ENTITIES.BUDGETS,
      url: `${PATHS.BUDGETS}/${id}/${PAYMENTS}`,
      value: { paymentsMade, updatedAt },
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[LIST_BUDGETS_QUERY_KEY], [GET_BUDGET_QUERY_KEY, id]]
    });
  };

  return updatePayments;
};
