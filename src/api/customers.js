import { usePaginationContext } from "@/components/common/table/Pagination";
import { TIME_IN_MS } from "@/constants";
import { CLIENT_ID, PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
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

export function useListCustomers({ cache = true, sort, order = true, pageSize, }) {
  const { addKey, currentPage, keys, filters, handleEntityChange } = usePaginationContext();

  useEffect(() => {
    handleEntityChange("customers")
  }, []);

  const params = {
    pageSize: pageSize || "10",
    ...(keys["customers"][currentPage] && { LastEvaluatedKey: encodeURIComponent(JSON.stringify(keys["customers"][currentPage])) }),
    ...(sort && { sort }),
    ...(order && { order }),
    ...filters
  };

  const listCustomers = async (params) => {
    try {
      const { data } = await axios.get(CUSTOMERS_URL, { params });
      if (data?.LastEvaluatedKey && !data?.products.length < params.pageSize) {
        addKey(data?.LastEvaluatedKey, "customers");
      }
      return { customers: data?.customers || [], LastEvaluatedKey: data.LastEvaluatedKey }
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_CUSTOMERS_QUERY_KEY, params],
    queryFn: () => listCustomers(params),
    retry: false,
    staleTime: cache ? TIME_IN_MS.ONE_MINUTE : 0,
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
