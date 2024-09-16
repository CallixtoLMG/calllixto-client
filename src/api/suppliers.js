import { ENTITIES, TIME_IN_MS } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';
import { createItem, deleteItem, getItemById, listItems } from "./common";


export const GET_SUPPLIER_QUERY_KEY = 'getSupplier';
export const LIST_SUPPLIERS_QUERY_KEY = 'listSuppliers';

export function useListSuppliers() {
  const query = useQuery({
    queryKey: [LIST_SUPPLIERS_QUERY_KEY],
    queryFn: () => listItems({ entity: ENTITIES.SUPPLIERS, url: PATHS.SUPPLIERS, params: { sort: 'id', order: true } }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetSupplier(id) {
  const query = useQuery({
    queryKey: [GET_SUPPLIER_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: PATHS.SUPPLIERS, entity: ENTITIES.SUPPLIERS }),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};

export function createSupplier(supplier) {
  return createItem({ entity: ENTITIES.SUPPLIERS, url: PATHS.SUPPLIERS, value: supplier, responseEntity: ENTITIES.SUPPLIER });
};

export function deleteSupplier(id) {
  return deleteItem({ entity: ENTITIES.SUPPLIERS, id, url: PATHS.SUPPLIERS });
};

export function edit(supplier) {
  const body = {
    ...supplier,
    updatedAt: now()
  }
  return axios.put(`${PATHS.SUPPLIERS}/${supplier.id}`, body);
};
