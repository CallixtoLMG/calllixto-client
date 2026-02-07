import { ENTITIES, INACTIVE, IN_MS, SET_STATE } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { GET_SUPPLIER_QUERY_KEY, LIST_ATTRIBUTES, LIST_SUPPLIERS_QUERY_KEY } from "@/components/suppliers/suppliers.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from "@tanstack/react-query";
import { getInstance } from "./axios";
import { listItems, useCreateItem, useDeleteItem, useEditItem, usePostUpdateItem } from "./common";

export function useListSuppliers() {
  const query = useQuery({
    queryKey: [LIST_SUPPLIERS_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.SUPPLIERS,
      url: PATHS.SUPPLIERS,
      params: getDefaultListParams(LIST_ATTRIBUTES)
    }),
    staleTime: 0,
  });

  return query;
};

export function useGetSupplier(id) {
  const getSupplier = async (id) => {
    try {
      const { data } = await getInstance().get(`${PATHS.SUPPLIERS}/${id}`);

      return data?.supplier ?? null;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_SUPPLIER_QUERY_KEY, id],
    queryFn: () => getSupplier(id),
    retry: false,
    staleTime: IN_MS.ONE_HOUR,
    enabled: !!id,
  });

  return query;
};

export const useCreateSupplier = () => {
  const createItem = useCreateItem();

  const createSupplier = (supplier) => {
    return createItem({
      entity: ENTITIES.SUPPLIERS,
      url: PATHS.SUPPLIERS,
      value: supplier,
      responseEntity: ENTITIES.SUPPLIER,
      invalidateQueries: [[LIST_SUPPLIERS_QUERY_KEY]],
    });
  };

  return createSupplier;
};

export const useDeleteSupplier = () => {
  const deleteItem = useDeleteItem();

  const deleteSupplier = async (id) => {
    const response = await deleteItem({
      entity: ENTITIES.SUPPLIERS,
      id,
      url: `${PATHS.SUPPLIERS}/${id}`,
      invalidateQueries: [[LIST_SUPPLIERS_QUERY_KEY]]
    });

    return response;
  };

  return deleteSupplier;
};

export const useEditSupplier = () => {
  const editItem = useEditItem();


  const editSupplier = async (supplier) => {

    const response = await editItem({
      entity: ENTITIES.SUPPLIERS,
      url: `${PATHS.SUPPLIERS}/${supplier.id}`,
      value: supplier,
      key: "id",
      responseEntity: ENTITIES.SUPPLIER,
      invalidateQueries: [[LIST_SUPPLIERS_QUERY_KEY], [GET_SUPPLIER_QUERY_KEY, supplier.id]]
    });

    return response;
  };

  return editSupplier;
};

export const useSetSupplierState = () => {
  const updateItem = usePostUpdateItem();

  const setSupplierState = ({ id, state, inactiveReason }) => {
    return updateItem({
      entity: ENTITIES.SUPPLIERS,
      url: `${PATHS.SUPPLIERS}/${id}/${SET_STATE}`,
      value: {
        id,
        state,
        ...(state === INACTIVE && { inactiveReason }),
      },
      responseEntity: ENTITIES.SUPPLIER,
      invalidateQueries: [
        [LIST_SUPPLIERS_QUERY_KEY],
        [GET_SUPPLIER_QUERY_KEY, id],
      ],
      attributes: LIST_ATTRIBUTES,
    });
  };

  return setSupplierState;
};


