import { ACTIVE, ENTITIES, INACTIVE, IN_MS } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { ATTRIBUTES, GET_CUSTOMER_QUERY_KEY, LIST_CUSTOMERS_QUERY_KEY } from "@/components/customers/customers.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from "@tanstack/react-query";
import { getInstance } from "./axios";
import { listItems, useActiveItem, useCreateItem, useDeleteItem, useEditItem, useInactiveItem } from "./common";

export function useListCustomers() {
  const query = useQuery({
    queryKey: [LIST_CUSTOMERS_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.CUSTOMERS,
      url: PATHS.CUSTOMERS,
      params: getDefaultListParams(ATTRIBUTES)
    }),
    retry: false,
    staleTime: 0,
  });

  return query;
}

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
      url: PATHS.CUSTOMERS,
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
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY], [GET_CUSTOMER_QUERY_KEY, customer.id]]
    });
  };

  return editCustomer;
};

export const useInactiveCustomer = () => {
  const inactiveItem = useInactiveItem();

  const inactiveCustomer = (customer, reason) => {
    return inactiveItem({
      entity: ENTITIES.CUSTOMERS,
      url: `${PATHS.CUSTOMERS}/${customer.id}/${INACTIVE}`,
      value: {
        id: customer.id,
        inactiveReason: reason
      },
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY], [GET_CUSTOMER_QUERY_KEY, customer.id]]
    });
  };

  return inactiveCustomer;
};

export const useActiveCustomer = () => {
  const activeItem = useActiveItem();

  const activeCustomer = (customer) => {
    return activeItem({
      entity: ENTITIES.CUSTOMERS,
      url: `${PATHS.CUSTOMERS}/${customer.id}/${ACTIVE}`,
      value: {
        id: customer.id,
      },
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY], [GET_CUSTOMER_QUERY_KEY, customer.id]]
    });
  };

  return activeCustomer;
};
