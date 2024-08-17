import { ENTITIES, TIME_IN_MS } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';
import { listItems, getItemById, createItem, deleteItem } from "./common";


const SUPPLIER_URL = `${PATHS.SUPPLIERS}`;
export const GET_SUPPLIER_QUERY_KEY = 'getSupplier';
export const LIST_SUPPLIERS_QUERY_KEY = 'listSuppliers';

export function useListAllSuppliers() {
  const query = useQuery({
    queryKey: [LIST_SUPPLIERS_QUERY_KEY],
    queryFn: () => listItems({ entity: ENTITIES.SUPPLIERS, url: SUPPLIER_URL, params: { sort: 'id', order: true } }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetSupplier(id) {
  const query = useQuery({
    queryKey: [GET_SUPPLIER_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: SUPPLIER_URL, entity: ENTITIES.SUPPLIERS }),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};

export function createSupplier(supplier) {
  return createItem({ entity: ENTITIES.SUPPLIERS, url: SUPPLIER_URL, value: supplier });
};

export function deleteSupplier(id) {
  return deleteItem({ entity: ENTITIES.SUPPLIERS, id, url: SUPPLIER_URL });
};

export function edit(supplier) {
  const body = {
    ...supplier,
    updatedAt: now()
  }
  return axios.put(`${SUPPLIER_URL}/${supplier.id}`, body);
};
