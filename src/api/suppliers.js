import { usePaginationContext } from "@/components/common/table/Pagination";
import { DEFAULT_PAGE_SIZE, ENTITIES, TIME_IN_MS } from "@/constants";
import { CLIENT_ID, PATHS } from "@/fetchUrls";
import { encodeUri, now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';

const SUPPLIER_URL = `${CLIENT_ID}${PATHS.SUPPLIERS}`;
export const LIST_SUPPLIERS_QUERY_KEY = 'listSuppliers';
export const GET_SUPPLIER_QUERY_KEY = 'getSupplier';
export const LIST_ALL_SUPPLIER_QUERY_KEY = 'listAllSuppliers';

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

export function useListSuppliers({ sort, order = true, pageSize = DEFAULT_PAGE_SIZE }) {
  const { addKey, currentPage, keys, filters } = usePaginationContext();

  const params = {
    pageSize,
    ...(keys[ENTITIES.SUPPLIERS][currentPage] && {
      LastEvaluatedKey: encodeUri(JSON.stringify(keys[ENTITIES.SUPPLIERS][currentPage]))
    }),
    ...(sort && { sort }),
    order,
    ...filters
  };

  const listSuppliers = async (params) => {
    try {
      const { data } = await axios.get(SUPPLIER_URL, { params });
      if (data?.LastEvaluatedKey) {
        addKey(data?.LastEvaluatedKey, ENTITIES.SUPPLIERS);
      }
      return { suppliers: data?.suppliers || [], LastEvaluatedKey: data.LastEvaluatedKey }
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_SUPPLIERS_QUERY_KEY, params],
    queryFn: () => listSuppliers(params),
  });

  return query;
};

export function useListAllSuppliers({attributes = []}) {
  const listSuppliers = async () => {
    try {
      let suppliers = [];
      let LastEvaluatedKey;

      do {
        const params = {
          attributes: encodeUri(JSON.stringify(attributes)),
          ...(LastEvaluatedKey && { LastEvaluatedKey: encodeUri(JSON.stringify(LastEvaluatedKey)) }),
        };

        const { data } = await axios.get(SUPPLIER_URL, { params });

        if (data.statusOk) {
          suppliers = [...suppliers, ...data.suppliers];
        }

        LastEvaluatedKey = data?.LastEvaluatedKey;

      } while (LastEvaluatedKey);

      return { suppliers };
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_ALL_SUPPLIER_QUERY_KEY, attributes], 
    queryFn: () => listSuppliers(),
    staleTime: TIME_IN_MS.FOUR_HOURS,
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
