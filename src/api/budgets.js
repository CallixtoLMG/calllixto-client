import { TIME_IN_MS, ENTITIES } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';
import { listItems, getItemById, createItem } from "./common";

const BUDGETS_URL = `${PATHS.BUDGETS}`;
export const LIST_BUDGETS_QUERY_KEY = 'lisAllBudgets';
export const GET_BUDGET_QUERY_KEY = 'getBudget';

export function useListBudgets() {
  const query = useQuery({
    queryKey: [LIST_BUDGETS_QUERY_KEY],
    queryFn: () => listItems({ entity: ENTITIES.BUDGETS, url: BUDGETS_URL }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
}

export function useGetBudget(id) {
  const query = useQuery({
    queryKey: [GET_BUDGET_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: BUDGETS_URL, entity: ENTITIES.BUDGETS }),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};

export function createBudget(budget) {
  return createItem({ entity: ENTITIES.BUDGETS, url: BUDGETS_URL, value: budget, responseEntity: 'budget' });
};

export function edit(budget) {
  const body = {
    ...budget,
    updatedAt: now(),
  };
  return axios.put(`${BUDGETS_URL}/${budget.id}`, body);
};

export function confirmBudget(budget, id) {
  return axios.put(`${BUDGETS_URL}/${id}/confirm`, budget);
};

export function cancelBudget(budget, id) {
  return axios.put(`${BUDGETS_URL}/${id}/cancel`, budget);
};
