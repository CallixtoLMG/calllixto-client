import { usePaginationContext } from "@/components/common/table/Pagination";
import { TIME_IN_MS } from "@/constants";
import { CLIENT_ID, PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
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

export function useListBudgets({ cache = true, sort, order = true, pageSize, }) {
  const { addKey, currentPage, keys, filters, handleEntityChange } = usePaginationContext();

  useEffect(() => {
    handleEntityChange("budgets")
  }, []);

  const params = {
    pageSize: pageSize || "10",
    ...(keys["budgets"][currentPage] && { LastEvaluatedKey: encodeURIComponent(JSON.stringify(keys["budgets"][currentPage])) }),
    ...(sort && { sort }),
    ...(order && { order }),
    ...filters
  };

  const listBudgets = async (params) => {
    try {
      const { data } = await axios.get(BUDGETS_URL, { params });
      if (data?.LastEvaluatedKey && !data?.products.length < params.pageSize) {
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
    retry: false,
    staleTime: cache ? TIME_IN_MS.ONE_MINUTE : 0,
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
