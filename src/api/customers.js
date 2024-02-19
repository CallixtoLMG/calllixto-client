import { CLIENT_ID, PATHS } from "@/fetchUrls";
import axios from './axios';
import { useQuery } from "@tanstack/react-query";
import { TIME_IN_MS } from "@/constants";
import { now } from "@/utils";

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

export function useListCustomers() {
  const listCustomers = async () => {
    try {
      const { data } = await axios.get(CUSTOMERS_URL);
      return data?.customers || [];
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_CUSTOMERS_QUERY_KEY],
    queryFn: () => listCustomers(),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
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
