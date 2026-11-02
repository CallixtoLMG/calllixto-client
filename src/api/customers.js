import { ENTITIES, INACTIVE, IN_MS, SET_STATE } from "@/common/constants";
import { GET_CUSTOMER_QUERY_KEY, CUSTOMER_CATALOG_QUERY_KEY } from "@/components/customers/customers.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInstance } from "./axios";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useCreateItem, useDeleteItem, useEditItem, usePostUpdateItem } from "./common";
import { fetchAllListPages, invalidateServerLists, usePagedList } from "./pagedLists";

export const usePagedCustomers = (state) => usePagedList({ ...state, entity: ENTITIES.CUSTOMERS, url: PATHS.CUSTOMERS });

export const fetchCustomersForExport = ({ appliedFilters, sort, order }) => fetchAllListPages({
  entity: ENTITIES.CUSTOMERS, url: PATHS.CUSTOMERS, filters: appliedFilters, sort, order,
});

export const customerCatalogOptions = () => ({
  queryKey: [CUSTOMER_CATALOG_QUERY_KEY],
  queryFn: async ({ signal }) => ({ customers: await fetchAllListPages({
    entity: ENTITIES.CUSTOMERS, url: PATHS.CUSTOMERS, signal,
  }) }),
  staleTime: 5 * 60 * 1000,
  retry: false,
});

export function useCustomerCatalog() {
  const query = useQuery(customerCatalogOptions());
  useEffect(() => {
    if (query.error) toast.error(query.error.message);
  }, [query.error]);
  return query;
}

const invalidateCustomerLists = async (queryClient) => {
  const queryKey = [CUSTOMER_CATALOG_QUERY_KEY];
  await queryClient.cancelQueries({ queryKey });
  await queryClient.invalidateQueries({ queryKey });
  await invalidateServerLists(queryClient, ENTITIES.CUSTOMERS);
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
      skipStorageUpdate: true,
      url: PATHS.CUSTOMERS,
      value: customer,
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [],
    });
    if (data?.statusOk) await invalidateCustomerLists(queryClient);
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
      skipStorageUpdate: true,
      id,
      url: `${PATHS.CUSTOMERS}/${id}`,
      invalidateQueries: []
    });
    if (data?.statusOk) await invalidateCustomerLists(queryClient);
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
      skipStorageUpdate: true,
      url: `${PATHS.CUSTOMERS}/${customer.id}`,
      value: customer,
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [[GET_CUSTOMER_QUERY_KEY, customer.id]],
    });
    if (data?.statusOk) await invalidateCustomerLists(queryClient);
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
      skipStorageUpdate: true,
      url: `${PATHS.CUSTOMERS}/${id}/${SET_STATE}`,
      value: {
        id,
        state,
        ...(state === INACTIVE && { inactiveReason }),
      },
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [
        [GET_CUSTOMER_QUERY_KEY, id],
      ],
    });
    if (data?.statusOk) await invalidateCustomerLists(queryClient);
    return data;
  };

  return setCustomerState;
};
