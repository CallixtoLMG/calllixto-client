import { ENTITIES, INACTIVE, IN_MS, SET_STATE } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { GET_CUSTOMER_QUERY_KEY, LIST_ATTRIBUTES, LIST_CUSTOMERS_QUERY_KEY } from "@/components/customers/customers.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from "@tanstack/react-query";
import { getInstance } from "./axios";
import { listItems, useCreateItem, useDeleteItem, useEditItem, usePostUpdateItem } from "./common";

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

  const createCustomer = (customer) => {
    return createItem({
      entity: ENTITIES.CUSTOMERS,
      url: PATHS.CUSTOMERS,
      value: customer,
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY]],
      attributes: LIST_ATTRIBUTES
    });
  };

  return createCustomer;
};

export const useDeleteCustomer = () => {
  const deleteItem = useDeleteItem();

  const deleteCustomer = (id) => {
    return deleteItem({
      entity: ENTITIES.CUSTOMERS,
      id,
      url: `${PATHS.CUSTOMERS}/${id}`,
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY]]
    });
  };

  return deleteCustomer;
};

export const useEditCustomer = () => {
  const editItem = useEditItem();

  const editCustomer = (customer) => {
    return editItem({
      entity: ENTITIES.CUSTOMERS,
      url: `${PATHS.CUSTOMERS}/${customer.id}`,
      value: customer,
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY], [GET_CUSTOMER_QUERY_KEY, customer.id]],
      attributes: LIST_ATTRIBUTES
    });
  };

  return editCustomer;
};

export const useSetCustomerState = () => {
  const updateItem = usePostUpdateItem();

  const setCustomerState = ({ id, state, inactiveReason }) => {
    return updateItem({
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
  };

  return setCustomerState;
};