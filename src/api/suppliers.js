import { ENTITIES, TIME_IN_MS } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';
import { getAllEntity, getEntityById } from "./common";


const SUPPLIER_URL = `${PATHS.SUPPLIERS}`;
export const GET_SUPPLIER_QUERY_KEY = 'getSupplier';
export const LIST_SUPPLIERS_QUERY_KEY = 'listSuppliers';

export function create(supplier) {
  const body = {
    ...supplier,
    createdAt: now()
  }
  return axios.post(SUPPLIER_URL, body);
};

export function edit(supplier) {
  const body = {
    ...supplier,
    updatedAt: now()
  }
  return axios.put(`${SUPPLIER_URL}/${supplier.id}`, body);
};

export function deleteSupplier(id) {
  return axios.delete(`${SUPPLIER_URL}/${id}`);
};

export function useListAllSuppliers() {
  const query = useQuery({
    queryKey: [LIST_SUPPLIERS_QUERY_KEY],
    queryFn: () => getAllEntity({ entity: ENTITIES.SUPPLIERS, url: SUPPLIER_URL, params: { sort: 'id', order: true } }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetSupplier(id) {
  const query = useQuery({
    queryKey: [GET_SUPPLIER_QUERY_KEY, id],
    queryFn: () => getEntityById({ id, url: SUPPLIER_URL, entity: ENTITIES.SUPPLIERS }),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};
