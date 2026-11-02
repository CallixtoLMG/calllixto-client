import { ACTIVE, ENTITIES, INACTIVE, IN_MS, RECOVER, SET_STATE } from "@/common/constants";
import { GET_PRODUCT_QUERY_KEY, MAIN_KEY } from "@/components/products/products.constants";
import {
  BATCH,
  EDIT_BATCH,
  PATHS,
  SUPPLIER
} from "@/fetchUrls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chunk } from "lodash";
import { getInstance } from "./axios";
import { fetchAllListPages, usePagedList } from "./pagedLists";
import { invalidateProductData } from "./productCatalogs";
import { useBatchDeleteItem, useCreateItem, useDeleteItem, useEditItem, usePostUpdateItem } from "./common";

export const usePagedProducts = (state) => usePagedList({ ...state, entity: ENTITIES.PRODUCTS, url: PATHS.PRODUCTS });

export const fetchProductsForExport = ({ appliedFilters, sort, order }) => fetchAllListPages({
  entity: ENTITIES.PRODUCTS, url: PATHS.PRODUCTS, filters: appliedFilters, sort, order,
});

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
  const queryClient = useQueryClient();
  const createItem = useCreateItem();

  const createProduct = async (product) => {
    const data = await createItem({
      entity: ENTITIES.PRODUCTS,
      skipStorageUpdate: true,
      url: PATHS.PRODUCTS,
      value: product,
      responseEntity: ENTITIES.PRODUCT,
      invalidateQueries: [],
    });
    if (data?.statusOk) await invalidateProductData(queryClient, { ids: [product.id] });
    return data;
  };

  return createProduct;
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const deleteItem = useDeleteItem();

  const deleteProduct = async (id) => {
    const data = await deleteItem({
      entity: ENTITIES.PRODUCTS,
      skipStorageUpdate: true,
      id: id,
      url: `${PATHS.PRODUCTS}/${id}`,
      invalidateQueries: []
    });
    if (data?.statusOk) await invalidateProductData(queryClient, { ids: [id] });
    return data;
  };

  return deleteProduct;
};

export const useBatchDeleteProducts = () => {
  const queryClient = useQueryClient();
  const batchDeleteItem = useBatchDeleteItem();

  const deleteProducts = async (ids) => {
    const data = await batchDeleteItem({ url: PATHS.PRODUCTS, ids });
    if (data?.deletedCount > 0) await invalidateProductData(queryClient, { ids });
    return data;
  };

  return deleteProducts;
};

export const useEditProduct = () => {
  const queryClient = useQueryClient();
  const editItem = useEditItem();

  const editProduct = async ({ previousVersions, ...rest }) => {
    const data = await editItem({
      entity: ENTITIES.PRODUCTS,
      skipStorageUpdate: true,
      url: `${PATHS.PRODUCTS}/${rest.id}`,
      value: rest,
      key: MAIN_KEY,
      responseEntity: ENTITIES.PRODUCT,
      invalidateQueries: [[GET_PRODUCT_QUERY_KEY, rest.id]]
    });
    if (data?.statusOk) await invalidateProductData(queryClient, { ids: [rest.id] });
    return data;
  };

  return editProduct;
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

    const completion = Promise.allSettled(promises);
    const responses = await Promise.all(promises).finally(async () => {
      await completion;
      await invalidateProductData(queryClient, { ids: products.map((product) => product.id) });
    });

    const data = {
      statusOk: true,
      unprocessed: responses
        .map((response) => (response?.data?.statusOk ? response.data.unprocessed : []))
        .flat()
        .filter((item) => item),
    };

    return { data };
  };

  return createBatch;
};

const MAX_PRODUCT_BATCH_SIZE = 500;

export const useEditBatch = () => {
  const queryClient = useQueryClient();

  const editBatch = async (products) => {
    const chunks = chunk(products, MAX_PRODUCT_BATCH_SIZE);
    let delay = 0;
    const delayIncrement = 1000;

    const promises = chunks.map((chunk) => {
      delay += delayIncrement;
      return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
        getInstance().post(`${PATHS.PRODUCTS}/${EDIT_BATCH}`, { update: chunk })
      );
    });

    const completion = Promise.allSettled(promises);
    const responses = await Promise.all(promises).finally(async () => {
      await completion;
      await invalidateProductData(queryClient, { ids: products.map((product) => product.id) });
    });

    const data = {
      statusOk: true,
      unprocessed: responses
        .map((response) => (response?.data?.statusOk ? response.data.unprocessed : []))
        .flat()
        .filter((item) => item),
    };

    return { data };
  };

  return editBatch;
};

export const useDeleteBySupplierId = () => {
  const queryClient = useQueryClient();

  const deleteProductsBySupplierId = async (supplierId) => {

    const { data } = await getInstance().delete(`${PATHS.PRODUCTS}/${SUPPLIER}/${supplierId}`);

    if (data.statusOk) {
      await invalidateProductData(queryClient, { supplierIds: [supplierId] });
      queryClient.invalidateQueries({ queryKey: [GET_PRODUCT_QUERY_KEY], refetchType: "none" });
    }

    return data;
  };

  return deleteProductsBySupplierId;
};

export const useSetProductState = () => {
  const queryClient = useQueryClient();
  const updateItem = usePostUpdateItem();

  const setProductState = async ({ id, state, inactiveReason }) => {
    const data = await updateItem({
      entity: ENTITIES.PRODUCTS,
      skipStorageUpdate: true,
      url: `${PATHS.PRODUCTS}/${id}/${SET_STATE}`,
      value: {
        id,
        state,
        ...(state === INACTIVE && { inactiveReason }),
      },
      responseEntity: ENTITIES.PRODUCT,
      invalidateQueries: [
        [GET_PRODUCT_QUERY_KEY, id],
      ],
    });
    if (data?.statusOk) await invalidateProductData(queryClient, { ids: [id] });
    return data;
  };

  return setProductState;
};

export const useRecoverProduct = () => {
  const queryClient = useQueryClient();
  const recoverItem = usePostUpdateItem();

  const recoverProduct = async ({ id }) => {
    const data = await recoverItem({
      entity: ENTITIES.PRODUCTS,
      skipStorageUpdate: true,
      url: `${PATHS.PRODUCTS}/${id}/${RECOVER}`,
      key: MAIN_KEY,
      responseEntity: ENTITIES.PRODUCT,
      invalidateQueries: [[GET_PRODUCT_QUERY_KEY, id]]
    });
    if (data?.statusOk) await invalidateProductData(queryClient, { ids: [id] });
    return data;
  };

  return recoverProduct;
};

