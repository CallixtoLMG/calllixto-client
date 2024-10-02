import { ATTRIBUTES } from "@/components/budgets/budgets.common";
import { ENTITIES, TIME_IN_MS } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { encodeUri } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';
import { listItems, useCreateItem, useEditItem } from "./common";

export const LIST_BUDGETS_QUERY_KEY = 'lisAllBudgets';
export const GET_BUDGET_QUERY_KEY = 'getBudget';

export function useListBudgets() {
  const query = useQuery({
    queryKey: [LIST_BUDGETS_QUERY_KEY],
    queryFn: () => listItems({ entity: ENTITIES.BUDGETS, url: PATHS.BUDGETS, params: { attributes: encodeUri(Object.values(ATTRIBUTES)) } }),
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
      key: "id",
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
      url: `${PATHS.BUDGETS}/${id}/confirm`,
      value: budget,
      responseEntity: ENTITIES.BUDGET,
      invalidateQueries: [[LIST_BUDGETS_QUERY_KEY]],
    });
    console.log(response)
    return response;
  };

  return confirmBudget
};

export function cancelBudget(budget, id) {
  return axios.put(`${PATHS.BUDGETS}/${id}/cancel`, budget);
};
