import { ENTITIES, TIME_IN_MS } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';
import { createItem, deleteItem, getItemById, listItems } from "./common";

export const LIST_CUSTOMERS_QUERY_KEY = 'listCustomers';
export const GET_CUSTOMER_QUERY_KEY = 'getCustomer';

export function useListCustomers() {
  const query = useQuery({
    queryKey: [LIST_CUSTOMERS_QUERY_KEY],
    queryFn: () => listItems({ entity: ENTITIES.CUSTOMERS, url: PATHS.CUSTOMERS, params: { sort: 'name', order: true } }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetCustomer(id) {
  const query = useQuery({
    queryKey: [GET_CUSTOMER_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: PATHS.CUSTOMERS, entity: ENTITIES.CUSTOMERS }),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};

export function createCustomer(customer) {
  return createItem({ entity: ENTITIES.CUSTOMERS, url: PATHS.CUSTOMERS, value: customer, responseEntity: ENTITIES.CUSTOMER });
};

export function deleteCustomer(id) {
  return deleteItem({ entity: ENTITIES.CUSTOMERS, id, url: PATHS.CUSTOMERS });
};

export function edit(customer) {
  const body = {
    ...customer,
    updatedAt: now()
  }
  return axios.put(`${PATHS.CUSTOMERS}/${customer.id}`, body);
};
