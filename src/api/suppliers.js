import { CLIENT_ID, PATHS } from "@/fetchUrls";
import axios from './axios';
import { useQuery } from "@tanstack/react-query";
import { TIME_IN_MS } from "@/constants";
import { now } from "@/utils";

const SUPPLIER_URL = `${CLIENT_ID}${PATHS.SUPPLIERS}`;
export const LIST_SUPPLIERS_QUERY_KEY = 'listSuppliers';
export const GET_SUPPLIER_QUERY_KEY = 'getSupplier';

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

export function useListSuppliers() {
  const listSuppliers = async () => {
    try {
      const { data } = await axios.get(SUPPLIER_URL);
      return data?.suppliers || [];
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_SUPPLIERS_QUERY_KEY],
    queryFn: () => listSuppliers(),
    retry: false,
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetSupplier(id) {
  const getSupplier = async (id) => {
    try {
      const { data } = await axios.get(`${SUPPLIER_URL}/${id}`);
      return data?.supplier;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_SUPPLIER_QUERY_KEY, id],
    queryFn: () => getSupplier(id),
    retry: false,
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};
