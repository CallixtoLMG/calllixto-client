import { ENTITIES, TIME_IN_MS } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';
import { getAllEntity } from "./common";

const CUSTOMERS_URL = `${PATHS.CUSTOMERS}`;

export const LIST_ALL_CUSTOMERS_QUERY_KEY = 'listAllCustomers';
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

export function useListAllCustomers() {
  const query = useQuery({
    queryKey: [LIST_ALL_CUSTOMERS_QUERY_KEY],
    queryFn: () => getAllEntity({ entity: ENTITIES.CUSTOMERS, url: CUSTOMERS_URL, params: { sort: 'name', order: true } }),
    staleTime: TIME_IN_MS.ONE_DAY,
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
