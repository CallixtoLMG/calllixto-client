import { TIME_IN_MS } from "@/constants";
import { CLIENT_ID, PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';

const BUDGETS_URL = `${CLIENT_ID}${PATHS.BUDGETS}`;
export const LIST_BUDGETS_QUERY_KEY = 'listBudgets';
export const GET_BUDGET_QUERY_KEY = 'getBudget';

export function create(budget) {
  const body = {
    ...budget,
    createdAt: now(),
  }
  return axios.post(BUDGETS_URL, body);
};

export function edit(budget, id) {
  return axios.post(`${BUDGETS_URL}/${id}`, budget);
};

export function useListBudgets() {
  const listBudgets = async () => {
    try {
      const { data } = await axios.get(BUDGETS_URL);
      return data?.budgets || [];
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_BUDGETS_QUERY_KEY],
    queryFn: () => listBudgets(),
    retry: false,
    staleTime: TIME_IN_MS.ONE_MINUTE,
  });

  return query;
};

export function useGetBudget(id) {
  if (!id) {
    return { budget: null, isLoading: false };
  }
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
  });

  return query;
};
