import { ENTITIES, INACTIVE, IN_MS, SET_STATE } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { GET_CUSTOMER_QUERY_KEY, LIST_ATTRIBUTES, LIST_CUSTOMERS_QUERY_KEY } from "@/components/customers/customers.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInstance } from "./axios";
import { listItems, useCreateItem, useDeleteItem, useEditItem, usePostUpdateItem } from "./common";
import { fetchAllListPages, invalidateServerLists, usePagedList } from "./pagedLists";

export const usePagedCustomers = (state) => usePagedList({ ...state, entity: ENTITIES.CUSTOMERS, url: PATHS.CUSTOMERS });

export const fetchCustomersForExport = ({ appliedFilters, sort, order }) => fetchAllListPages({
  entity: ENTITIES.CUSTOMERS, url: PATHS.CUSTOMERS, filters: appliedFilters, sort, order,
});

export function useListCustomers() {
  const query = useQuery({
    queryKey: [LIST_CUSTOMERS_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.CUSTOMERS,
      url: PATHS.CUSTOMERS,
      params: getDefaultListParams(LIST_ATTRIBUTES)
    }),
    retry: false,
  });

  return query;
};

export function useGetCustomer(id) {
  const getCustomer = async (id) => {
    try {
      const { data } = await getInstance().get(`${PATHS.CUSTOMERS}/${id}`);
      return data?.customer ?? null;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_CUSTOMER_QUERY_KEY, id],
    queryFn: () => getCustomer(id),
    retry: false,
    staleTime: IN_MS.ONE_HOUR,
    enabled: !!id,
  });

  return query;
};

export const useCreateCustomer = () => {
  const createItem = useCreateItem();
  const queryClient = useQueryClient();

  const createCustomer = async (customer) => {
    const data = await createItem({
      entity: ENTITIES.CUSTOMERS,
      url: PATHS.CUSTOMERS,
      value: customer,
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY]],
      attributes: LIST_ATTRIBUTES
    });
    if (data?.statusOk) await invalidateServerLists(queryClient, ENTITIES.CUSTOMERS);
    return data;
  };

  return createCustomer;
};

export const useDeleteCustomer = () => {
  const deleteItem = useDeleteItem();
  const queryClient = useQueryClient();

  const deleteCustomer = async (id) => {
    const data = await deleteItem({
      entity: ENTITIES.CUSTOMERS,
      id,
      url: `${PATHS.CUSTOMERS}/${id}`,
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY]]
    });
    if (data?.statusOk) await invalidateServerLists(queryClient, ENTITIES.CUSTOMERS);
    return data;
  };

  return deleteCustomer;
};

export const useEditCustomer = () => {
  const editItem = useEditItem();
  const queryClient = useQueryClient();

  const editCustomer = async (customer) => {
    const data = await editItem({
      entity: ENTITIES.CUSTOMERS,
      url: `${PATHS.CUSTOMERS}/${customer.id}`,
      value: customer,
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY], [GET_CUSTOMER_QUERY_KEY, customer.id]],
      attributes: LIST_ATTRIBUTES
    });
    if (data?.statusOk) await invalidateServerLists(queryClient, ENTITIES.CUSTOMERS);
    return data;
  };

  return editCustomer;
};

export const useSetCustomerState = () => {
  const updateItem = usePostUpdateItem();
  const queryClient = useQueryClient();

  const setCustomerState = async ({ id, state, inactiveReason }) => {
    const data = await updateItem({
      entity: ENTITIES.CUSTOMERS,
      url: `${PATHS.CUSTOMERS}/${id}/${SET_STATE}`,
      value: {
        id,
        state,
        ...(state === INACTIVE && { inactiveReason }),
      },
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [
        [LIST_CUSTOMERS_QUERY_KEY],
        [GET_CUSTOMER_QUERY_KEY, id],
      ],
      attributes: LIST_ATTRIBUTES,
    });
    if (data?.statusOk) await invalidateServerLists(queryClient, ENTITIES.CUSTOMERS);
    return data;
  };

  return setCustomerState;
};
