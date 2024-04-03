import { usePaginationContext } from "@/components/common/table/Pagination";
import { DEFAULT_PAGE_SIZE, TIME_IN_MS } from "@/constants";
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

export function useListBudgets({ sort, order = true, pageSize = DEFAULT_PAGE_SIZE }) {
  const { addKey, currentPage, keys, filters, } = usePaginationContext();


  const params = {
    pageSize,
    ...(keys["budgets"][currentPage] && { LastEvaluatedKey: encodeURIComponent(JSON.stringify(keys["budgets"][currentPage])) }),
    ...(sort && { sort }),
    order,
    ...filters
  };

  const listBudgets = async (params) => {
    try {
      const { data } = await axios.get(BUDGETS_URL, { params });
      if (data?.LastEvaluatedKey) {
        addKey(data?.LastEvaluatedKey, "budgets");
      }
      return { budgets: data?.budgets || [], LastEvaluatedKey: data.LastEvaluatedKey }
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_BUDGETS_QUERY_KEY, params],
    queryFn: () => listBudgets(params),
  });

  return query;
};

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
