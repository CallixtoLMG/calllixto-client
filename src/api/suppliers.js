import { ACTIVE, ENTITIES, ID, INACTIVE, IN_MS } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { ATTRIBUTES, GET_SUPPLIER_QUERY_KEY, LIST_SUPPLIERS_QUERY_KEY } from "@/components/suppliers/suppliers.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from "@tanstack/react-query";
import { getItemById, listItems, useActiveItem, useCreateItem, useDeleteItem, useEditItem, useInactiveItem } from "./common";


export function useListSuppliers({ sort = ID, order = true } = {}) {
  const query = useQuery({
    queryKey: [LIST_SUPPLIERS_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.SUPPLIERS,
      url: PATHS.SUPPLIERS,
      params: getDefaultListParams(ATTRIBUTES, sort, order)
    }),
    staleTime: 0,
  });

  return query;
};

export function useGetSupplier(id) {
  const query = useQuery({
    queryKey: [GET_SUPPLIER_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: PATHS.SUPPLIERS, entity: ENTITIES.SUPPLIERS }),
    retry: false,
    staleTime: IN_MS.ONE_HOUR,
  });

  return query;
};

export const useCreateSupplier = () => {
  const createItem = useCreateItem();

  const createSupplier = async (supplier) => {
    const response = await createItem({
      entity: ENTITIES.SUPPLIERS,
      url: PATHS.SUPPLIERS,
      value: supplier,
      responseEntity: ENTITIES.SUPPLIER,
      invalidateQueries: [[LIST_SUPPLIERS_QUERY_KEY]],
    });

    return response;
  };

  return createSupplier;
};

export const useDeleteSupplier = () => {
  const deleteItem = useDeleteItem();

  const deleteSupplier = async (id) => {
    const response = await deleteItem({
      entity: ENTITIES.SUPPLIERS,
      id,
      url: PATHS.SUPPLIERS,
      key: "id",
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

export const useInactiveSupplier = () => {
  const inactiveItem = useInactiveItem();

  const inactiveSupplier = async (supplier, reason) => {
    const updatedSupplier = {
      id: supplier.id,
      inactiveReason: reason
    }

    const response = await inactiveItem({
      entity: ENTITIES.SUPPLIERS,
      url: `${PATHS.SUPPLIERS}/${supplier.id}/${INACTIVE}`,
      value: updatedSupplier,
      key: "id",
      responseEntity: ENTITIES.SUPPLIER,
      invalidateQueries: [[LIST_SUPPLIERS_QUERY_KEY], [GET_SUPPLIER_QUERY_KEY, supplier.id]]
    });

    return response;
  };

  return inactiveSupplier;
};

export const useActiveSupplier = () => {
  const activeItem = useActiveItem();

  const activeSupplier = async (supplier) => {
    const updatedSupplier = {
      id: supplier.id,
    }

    const response = await activeItem({
      entity: ENTITIES.SUPPLIERS,
      url: `${PATHS.SUPPLIERS}/${supplier.id}/${ACTIVE}`,
      value: updatedSupplier,
      key: "id",
      responseEntity: ENTITIES.SUPPLIER,
      invalidateQueries: [[LIST_SUPPLIERS_QUERY_KEY], [GET_SUPPLIER_QUERY_KEY, supplier.id]]
    });

    return response;
  };

  return activeSupplier;
};


