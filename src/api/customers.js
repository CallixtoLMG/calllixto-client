import { usePaginationContext } from "@/components/common/table/Pagination";
import { DEFAULT_PAGE_SIZE, ENTITIES, TIME_IN_MS } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { encodeUri, now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';

const CUSTOMERS_URL = `${PATHS.CUSTOMERS}`;

export const LIST_CUSTOMERS_QUERY_KEY = 'listCustomers';
export const LIST__ALL_CUSTOMERS_QUERY_KEY = 'listCustomers';
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

export function useListCustomers({ sort, order = true, pageSize = DEFAULT_PAGE_SIZE, attributes = [] }) {
  const { addKey, currentPage, keys, filters, } = usePaginationContext();

  const params = {
    attributes: encodeUri(attributes),
    pageSize,
    ...(keys[ENTITIES.CUSTOMERS][currentPage] && {
      LastEvaluatedKey: encodeUri(keys[ENTITIES.CUSTOMERS][currentPage])
    }),
    ...(sort && { sort }),
    order,
    ...filters
  };

  const listCustomers = async (params) => {
    try {
      const { data } = await axios.get(CUSTOMERS_URL, { params });
      if (data?.LastEvaluatedKey) {
        addKey(data?.LastEvaluatedKey, ENTITIES.CUSTOMERS);
      }
      return { customers: data?.customers || [], LastEvaluatedKey: data.LastEvaluatedKey }
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_CUSTOMERS_QUERY_KEY, params, attributes],
    queryFn: () => listCustomers(params),
  });

  return query;
};

export function useListAllCustomers({ attributes = [] }) {
  const listCustomers = async () => {
    try {
      let customers = [];
      let LastEvaluatedKey;

      do {
        const params = {
          ...(LastEvaluatedKey && { LastEvaluatedKey: encodeUri(LastEvaluatedKey) }),
          attributes: encodeUri(attributes)
        };

        const { data } = await axios.get(CUSTOMERS_URL, { params });

        if (data.statusOk) {
          customers = [...customers, ...data.customers];
        }

        LastEvaluatedKey = data?.LastEvaluatedKey;

      } while (LastEvaluatedKey);

      return { customers };
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST__ALL_CUSTOMERS_QUERY_KEY, attributes],
    queryFn: () => listCustomers(),
    staleTime: TIME_IN_MS.FOUR_HOURS,
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
