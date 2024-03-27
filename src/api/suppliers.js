import { usePaginationContext } from "@/components/common/table/Pagination";
import { TIME_IN_MS } from "@/constants";
import { CLIENT_ID, PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import axios from './axios';

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

export function useListSuppliers({ cache = true, sort, order = true, pageSize, }) {

  const { addKey, currentPage, keys, filters, handleEntityChange } = usePaginationContext();

  useEffect(() => {
    handleEntityChange("products")
  }, []);

  const params = {
    pageSize: pageSize || "5",
    ...(keys["suppliers"][currentPage] && { LastEvaluatedKey: encodeURIComponent(JSON.stringify(keys["suppliers"][currentPage])) }),
    ...(sort && { sort }),
    ...(order && { order }),
    ...filters
  };

  const listSuppliers = async (params) => {
    try {
      const { data } = await axios.get(SUPPLIER_URL, { params });
      if (data?.LastEvaluatedKey) {
        addKey(data.LastEvaluatedKey , "suppliers");
      }
      return { suppliers: data?.suppliers || [], LastEvaluatedKey: data.LastEvaluatedKey }
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_SUPPLIERS_QUERY_KEY, params],
    queryFn: () => listSuppliers(params),
    retry: false,
    staleTime: cache ? TIME_IN_MS.ONE_MINUTE : 0,
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
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};
