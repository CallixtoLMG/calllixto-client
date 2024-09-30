import { ATTRIBUTES } from "@/components/customers/customers.common";
import { ENTITIES, TIME_IN_MS } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { encodeUri } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { getItemById, listItems, useCreateItem, useDeleteItem, useEditItem } from "./common";

export const LIST_CUSTOMERS_QUERY_KEY = 'listCustomers';
export const GET_CUSTOMER_QUERY_KEY = 'getCustomer';

export function useListCustomers() {
  const query = useQuery({
    queryKey: [LIST_CUSTOMERS_QUERY_KEY],
    queryFn: () => listItems({ entity: ENTITIES.CUSTOMERS, url: PATHS.CUSTOMERS, params: { sort: 'name', order: true, attributes: encodeUri(Object.values(ATTRIBUTES)) } }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetCustomer(id) {
  const query = useQuery({
    queryKey: [GET_CUSTOMER_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: PATHS.CUSTOMERS, entity: ENTITIES.CUSTOMERS }),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
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
      key: "id",
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
      key: "id",
      responseEntity: ENTITIES.CUSTOMER,
      invalidateQueries: [[LIST_CUSTOMERS_QUERY_KEY], [GET_CUSTOMER_QUERY_KEY, customer.id]]
    });

    return response;
  };

  return editCustomer;
};
