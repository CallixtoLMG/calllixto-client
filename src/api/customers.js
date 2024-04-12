import { usePaginationContext } from "@/components/common/table/Pagination";
import { DEFAULT_PAGE_SIZE, ENTITIES, TIME_IN_MS } from "@/constants";
import { CLIENT_ID, PATHS } from "@/fetchUrls";
import { encodeUri, now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';
const CUSTOMERS_URL = `${CLIENT_ID}${PATHS.CUSTOMERS}`;
export const LIST_CUSTOMERS_QUERY_KEY = 'listCustomers';
export const GET_CUSTOMER_QUERY_KEY = 'getCustomer';

export function create(customer) {
  const body = {
    ...customer,
    createdAt: now()
  }
  return axios.post(CUSTOMERS_URL, body);
};

export function edit(customer) {
  const body = {
    ...customer,
    updatedAt: now()
  }
  return axios.put(`${CUSTOMERS_URL}/${customer.id}`, body);
};

export function deleteCustomer(id) {
  return axios.delete(`${CUSTOMERS_URL}/${id}`);
};

export function useListCustomers({ sort, order = true, pageSize = DEFAULT_PAGE_SIZE }) {
  const { addKey, currentPage, keys, filters, } = usePaginationContext();

  const params = {
    pageSize,
    ...(keys[ENTITIES.CUSTOMERS][currentPage] && {
      LastEvaluatedKey: encodeUri(JSON.stringify(keys[ENTITIES.CUSTOMERS][currentPage]))
    }),
    ...(sort && { sort }),
    order,
    ...filters
  };

  const listCustomers = async (params) => {
    try {
      const { data } = await axios.get(CUSTOMERS_URL, { params });
      if (data?.LastEvaluatedKey) {
        addKey(data?.LastEvaluatedKey, ENTITIES.CUSTOMERS);
      }
      return { customers: data?.customers || [], LastEvaluatedKey: data.LastEvaluatedKey }
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_CUSTOMERS_QUERY_KEY, params],
    queryFn: () => listCustomers(params),
  });

  return query;
};

export function useGetCustomer(id) {
  const getCustomer = async (id) => {
    try {
      const { data } = await axios.get(`${CUSTOMERS_URL}/${id}`);
      return data?.customer;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_CUSTOMER_QUERY_KEY, id],
    queryFn: () => getCustomer(id),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};
