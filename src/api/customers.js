import { ENTITIES, TIME_IN_MS } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';
import { createItem, listItems, getItemById, deleteItem } from "./common";

const CUSTOMERS_URL = `${PATHS.CUSTOMERS}`;
export const LIST_CUSTOMERS_QUERY_KEY = 'listCustomers';
export const GET_CUSTOMER_QUERY_KEY = 'getCustomer';

export function useListCustomers() {
  const query = useQuery({
    queryKey: [LIST_CUSTOMERS_QUERY_KEY],
    queryFn: () => listItems({ entity: ENTITIES.CUSTOMERS, url: CUSTOMERS_URL, params: { sort: 'name', order: true } }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetCustomer(id) {
  const query = useQuery({
    queryKey: [GET_CUSTOMER_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: CUSTOMERS_URL, entity: ENTITIES.CUSTOMERS }),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};

export function createCustomer(customer) {
  return createItem({ entity: ENTITIES.CUSTOMERS, url: CUSTOMERS_URL, value: customer });
};

export function deleteCustomer(id) {
  return deleteItem({ entity: ENTITIES.CUSTOMERS, id, url: CUSTOMERS_URL });
};

export function edit(customer) {
  const body = {
    ...customer,
    updatedAt: now()
  }
  return axios.put(`${CUSTOMERS_URL}/${customer.id}`, body);
};
