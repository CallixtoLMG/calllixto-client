import { TIME_IN_MS, ENTITIES } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';
import { getAllEntity } from "./common";

const BUDGETS_URL = `${PATHS.BUDGETS}`;

export const LIST_ALL_BUDGETS_QUERY_KEY = 'lisAllBudgets';
export const GET_BUDGET_QUERY_KEY = 'getBudget';

export function create(budget) {
  const body = {
    ...budget,
    createdAt: now(),
  }
  return axios.post(BUDGETS_URL, body);
};

export function confirmBudget(budget, id) {
  return axios.put(`${BUDGETS_URL}/${id}/confirm`, budget);
};

export function cancelBudget(budget, id) {
  return axios.put(`${BUDGETS_URL}/${id}/cancel`, budget);
};

export function edit(budget) {
  const body = {
    ...budget,
    updatedAt: now(),
  };
  return axios.put(`${BUDGETS_URL}/${budget.id}`, body);
};

export function useListAllBudgets() {
  const query = useQuery({
    queryKey: [LIST_ALL_BUDGETS_QUERY_KEY],
    queryFn: () => getAllEntity({ entity: ENTITIES.BUDGETS, url: BUDGETS_URL, params: { sort: 'date' } }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
}

export function useGetBudget(id) {
  const getBudget = async (id) => {
    try {
      const { data } = await axios.get(`${BUDGETS_URL}/${id}`);
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
