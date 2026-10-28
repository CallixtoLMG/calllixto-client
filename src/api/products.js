import { usePagedList } from "./pagedLists";
import { ACTIVE, ALL, DELETE, ENTITIES, HARD_DELETED, INACTIVE, IN_MS, RECOVER, SET_STATE } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { GET_PRODUCT_QUERY_KEY, LIST_ATTRIBUTES, LIST_PRODUCTS_BY_SUPPLIER_QUERY_KEY, LIST_PRODUCTS_QUERY_KEY, MAIN_KEY } from "@/components/products/products.constants";
import {
  BATCH,
  EDIT_BATCH,
  PATHS,
  SUPPLIER
} from "@/fetchUrls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chunk } from "lodash";
import { useCallback } from "react";
import { db } from "../db";
import { getInstance } from "./axios";
import { listItems, useBatchDeleteItem, useCreateItem, useDeleteItem, useEditItem, usePostUpdateItem } from "./common";
import { getSupplierProductsQueryOptions, invalidateSupplierProducts, loadSupplierProducts } from "./supplierProducts";

export function useListProducts(options = {}) {
  return usePagedList({
    entity: ENTITIES.PRODUCTS,
    url: PATHS.PRODUCTS,
    queryKey: LIST_PRODUCTS_QUERY_KEY,
    attributes: LIST_ATTRIBUTES,
    ...options,
  });
};

// Full catalog for selectors/association checks; never used as screen page data.
export function useProductCatalog({ enabled = true } = {}) {
  return useQuery({
    queryKey: [LIST_PRODUCTS_QUERY_KEY, "catalog"],
    queryFn: ({ signal } = {}) => listItems({
      entity: ENTITIES.PRODUCTS, url: PATHS.PRODUCTS,
      params: getDefaultListParams(LIST_ATTRIBUTES),
      signal,
    }),
    staleTime: IN_MS.ONE_DAY,
    retry: false,
    refetchOnWindowFocus: false,
    enabled,
  });
};

export function useGetProduct(id) {
  const getProduct = async (id) => {
    try {
      const { data } = await getInstance().get(`${PATHS.PRODUCTS}/${id}`);
      return data?.product ?? null;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_PRODUCT_QUERY_KEY, id],
    queryFn: () => getProduct(id),
    retry: false,
    staleTime: IN_MS.ONE_DAY,
    enabled: !!id,
  });

  return query;
};

export const useCreateProduct = () => {
  const createItem = useCreateItem();

  const createProduct = (product) => {
    return createItem({
      entity: ENTITIES.PRODUCTS,
      url: PATHS.PRODUCTS,
      value: product,
      responseEntity: ENTITIES.PRODUCT,
      invalidateQueries: [[LIST_PRODUCTS_QUERY_KEY]],
    });
  };

  return createProduct;
};

export const useDeleteProduct = () => {
  const deleteItem = useDeleteItem();

  const deleteProduct = (id) => {
    return deleteItem({
      entity: ENTITIES.PRODUCTS,
      id: id,
      url: `${PATHS.PRODUCTS}/${id}`,
      invalidateQueries: [[LIST_PRODUCTS_QUERY_KEY]]
    });
  };

  return deleteProduct;
};

export const useBatchDeleteProducts = () => {
  const batchDeleteItem = useBatchDeleteItem();

  const deleteProducts = (ids) => {
    return batchDeleteItem({
      entity: ENTITIES.PRODUCTS,
      url: PATHS.PRODUCTS,
      ids,
      deleteCondition: (data) => {
        const state = data.product?.state;
        return state === DELETE || state === HARD_DELETED;
      },
      invalidateQueries: [[LIST_PRODUCTS_QUERY_KEY]],
    });
  };

  return deleteProducts;
};

export const useEditProduct = () => {
  const editItem = useEditItem();

  const editProduct = async ({ previousVersions, ...rest }) => {
    return editItem({
      entity: ENTITIES.PRODUCTS,
      url: `${PATHS.PRODUCTS}/${rest.id}`,
      value: rest,
      key: MAIN_KEY,
      responseEntity: ENTITIES.PRODUCT,
      invalidateQueries: [[LIST_PRODUCTS_QUERY_KEY], [GET_PRODUCT_QUERY_KEY, rest.id]]
    });
  };

  return editProduct;
};

// Supplier tools need complete data only on an explicit user request.
export function useProductsBySupplierId(supplierId, { enabled = false } = {}) {
  const queryClient = useQueryClient();
  const query = useQuery({
    ...getSupplierProductsQueryOptions(supplierId),
    enabled: enabled && Boolean(supplierId),
  });
  const loadProducts = useCallback(() => loadSupplierProducts(queryClient, supplierId), [queryClient, supplierId]);
  const invalidateProducts = useCallback(() => invalidateSupplierProducts(queryClient, supplierId), [queryClient, supplierId]);
  return { ...query, loadProducts, invalidateProducts };
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  const createBatch = async (products) => {
    const parsedProducts = products.map((product) => ({
      ...product,
      state: ACTIVE,
    }));

    const chunks = chunk(parsedProducts, 500);
    let i = 25;

    const promises = chunks.map((chunk) => {
      const delay = Math.min(25000, 2 ** Math.log(i) * 100 + Math.random() * 100);
      i += i / 2;
      return new Promise((resolve) => setTimeout(resolve, delay)).then(() => {
        return getInstance().post(`${PATHS.PRODUCTS}/${BATCH}`, { products: chunk });
      });
    });

    const responses = await Promise.all(promises);

    const data = {
      statusOk: true,
      unprocessed: responses
        .map((response) => (response?.data?.statusOk ? response.data.unprocessed : []))
        .flat()
        .filter((item) => item),
    };

    if (data.statusOk) {
      queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY], refetchType: ALL })
    }

    return { data };
  };

  return createBatch;
};

export const useEditBatch = () => {
  const queryClient = useQueryClient();

  const editBatch = async (products, invalidateQueries = [[LIST_PRODUCTS_QUERY_KEY]]) => {
    const chunks = chunk(products, 500);
    let delay = 0;
    const delayIncrement = 1000;

    const promises = chunks.map((chunk) => {
      delay += delayIncrement;
      return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
        getInstance().post(`${PATHS.PRODUCTS}/${EDIT_BATCH}`, { update: chunk })
      );
    });

    const responses = await Promise.all(promises);

    const data = {
      statusOk: true,
      unprocessed: responses
        .map((response) => (response?.data?.statusOk ? response.data.unprocessed : []))
        .flat()
        .filter((item) => item),
    };

    if (data.statusOk) {
      invalidateQueries.forEach((query) =>
        queryClient.invalidateQueries({ queryKey: query, refetchType: ALL })
      );
    }

    return { data };
  };

  return editBatch;
};

export const useDeleteBySupplierId = () => {
  const queryClient = useQueryClient();

  const deleteProductsBySupplierId = async (supplierId) => {

    const { data } = await getInstance().delete(`${PATHS.PRODUCTS}/${SUPPLIER}/${supplierId}`);

    if (data.statusOk) {

      await db[ENTITIES.PRODUCTS]
        .where("id")
        .startsWith(supplierId)
        .delete();

      queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_BY_SUPPLIER_QUERY_KEY, supplierId], refetchType: ALL });
      queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY], refetchType: ALL });
      queryClient.invalidateQueries({ queryKey: [GET_PRODUCT_QUERY_KEY], refetchType: ALL });
    }

    return data;
  };

  return deleteProductsBySupplierId;
};

export const useSetProductState = () => {
  const updateItem = usePostUpdateItem();

  const setProductState = ({ id, state, inactiveReason }) => {
    return updateItem({
      entity: ENTITIES.PRODUCTS,
      url: `${PATHS.PRODUCTS}/${id}/${SET_STATE}`,
      value: {
        id,
        state,
        ...(state === INACTIVE && { inactiveReason }),
      },
      responseEntity: ENTITIES.PRODUCT,
      invalidateQueries: [
        [LIST_PRODUCTS_QUERY_KEY],
        [GET_PRODUCT_QUERY_KEY, id],
      ],
      attributes: LIST_ATTRIBUTES,
    });
  };

  return setProductState;
};

export const useRecoverProduct = () => {
  const recoverItem = usePostUpdateItem();

  const recoverProduct = ({ id }) => {
    return recoverItem({
      entity: ENTITIES.PRODUCTS,
      url: `${PATHS.PRODUCTS}/${id}/${RECOVER}`,
      key: MAIN_KEY,
      responseEntity: ENTITIES.PRODUCT,
      invalidateQueries: [[LIST_PRODUCTS_QUERY_KEY], [GET_PRODUCT_QUERY_KEY, id]]
    });
  };

  return recoverProduct;
};

