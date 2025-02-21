import { ACTIVE, ENTITIES, INACTIVE, IN_MS } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { ATTRIBUTES, LIST_CUSTOMERS_QUERY_KEY } from "@/components/customers/customers.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from "@tanstack/react-query";
import { getItemById, listItems, useActiveItem, useCreateItem, useDeleteItem, useEditItem, useInactiveItem } from "./common";


export function useListCustomers({ sort = 'name', order = true } = {}) {
  const query = useQuery({
    queryKey: [LIST_CUSTOMERS_QUERY_KEY, sort, order],
    queryFn: () => listItems({
      entity: ENTITIES.CUSTOMERS,
      url: PATHS.CUSTOMERS,
      params: getDefaultListParams(ATTRIBUTES, sort, order)
    }),
    retry: false,
    staleTime: 0,
  });

  return query;
}

export function useGetCustomer(id) {
  const query = useQuery({
    queryKey: [GET_CUSTOMER_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: PATHS.CUSTOMERS, entity: ENTITIES.CUSTOMERS }),
    retry: false,
    staleTime: IN_MS.ONE_HOUR,
  });

  return query;
};

export const useCreateCustomer = () => {
  const createItem = useCreateItem();

  const createCustomer = async (customer) => {
    const response = await createItem({
      entity: ENTITIES.CUSTOMERS,
      url: PATHS.CUSTOMERS,
      value: customer,
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY]],
    });

    return response;
  };

  return createCustomer;
};

export const useDeleteCustomer = () => {
  const deleteItem = useDeleteItem();

  const deleteCustomer = async (id) => {
    const response = await deleteItem({
      entity: ENTITIES.CUSTOMERS,
      id,
      url: PATHS.CUSTOMERS,
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY]]
    });

    return response;
  };

  return deleteCustomer;
};

export const useEditCustomer = () => {
  const editItem = useEditItem();

  const editCustomer = async (customer) => {

    const response = await editItem({
      entity: ENTITIES.CUSTOMERS,
      url: `${PATHS.CUSTOMERS}/${customer.id}`,
      value: customer,
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY], [GET_CUSTOMER_QUERY_KEY, customer.id]]
    });

    return response;
  };

  return editCustomer;
};

export const useInactiveCustomer = () => {
  const inactiveItem = useInactiveItem();

  const inactiveCustomer = async (customer, reason) => {
    const updatedCustomer = {
      ...customer,
      inactiveReason: reason
    }

    const response = await inactiveItem({
      entity: ENTITIES.CUSTOMERS,
      url: `${PATHS.CUSTOMERS}/${customer.id}/${INACTIVE}`,
      value: updatedCustomer,
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY], [GET_CUSTOMER_QUERY_KEY, customer.id]]
    });

    return response;
  };

  return inactiveCustomer;
};

export const useActiveCustomer = () => {
  const activeItem = useActiveItem();

  const activeCustomer = async (customer) => {
    const updatedCustomer = {
      ...customer,
    }

    const response = await activeItem({
      entity: ENTITIES.CUSTOMERS,
      url: `${PATHS.CUSTOMERS}/${customer.id}/${ACTIVE}`,
      value: updatedCustomer,
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY], [GET_CUSTOMER_QUERY_KEY, customer.id]]
    });

    return response;
  };

  return activeCustomer;
};
