import { ATTRIBUTES } from "@/components/products/products.common";
import { ACTIVE, ALL, CODE, ENTITIES, FILTERS_OPTIONS, getDefaultListParams, INACTIVE, TIME_IN_MS } from "@/constants";
import {
  BATCH,
  BLACK_LIST,
  EDIT_BATCH,
  PATHS,
  SUPPLIER
} from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chunk } from "lodash";
import axios from "./axios";
import { getItemById, listItems, removeStorageItemsByCustomFilter, useActiveItem, useCreateItem, useDeleteItem, useEditItem, useInactiveItem } from "./common";

export const LIST_PRODUCTS_QUERY_KEY = "listProducts";
export const LIST_PRODUCTS_BY_SUPPLIER_QUERY_KEY = "listProductsBySupplier";
export const GET_PRODUCT_QUERY_KEY = "getProduct";

export function useListProducts() {
  const query = useQuery({
    queryKey: [LIST_PRODUCTS_QUERY_KEY],
    queryFn: () => listItems({
      key: "code",
      entity: ENTITIES.PRODUCTS,
      url: PATHS.PRODUCTS,
      params: getDefaultListParams(ATTRIBUTES)
    }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetProduct(id) {
  const query = useQuery({
    queryKey: [GET_PRODUCT_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: PATHS.PRODUCTS, entity: ENTITIES.PRODUCTS, key: CODE }),
    retry: false,
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};

export const useCreateProduct = () => {
  const createItem = useCreateItem();

  const createProduct = async (product) => {
    const response = await createItem({
      entity: ENTITIES.PRODUCTS,
      url: PATHS.PRODUCTS,
      value: product,
      responseEntity: ENTITIES.PRODUCT,
      invalidateQueries: [[LIST_PRODUCTS_QUERY_KEY]],
    });

    return response;
  };

  return createProduct;
};

export const useDeleteProduct = () => {
  const deleteItem = useDeleteItem();

  const deleteProduct = async (code) => {
    const response = await deleteItem({
      entity: ENTITIES.PRODUCTS,
      id: code,
      url: PATHS.PRODUCTS,
      key: CODE,
      invalidateQueries: [[LIST_PRODUCTS_QUERY_KEY]]
    });

    return response;
  };

  return deleteProduct;
};

export const useEditProduct = () => {
  const editItem = useEditItem();

  const editProduct = async (product) => {
    const response = await editItem({
      entity: ENTITIES.PRODUCTS,
      url: `${PATHS.PRODUCTS}/${product.code}`,
      value: product,
      key: CODE,
      responseEntity: ENTITIES.PRODUCT,
      invalidateQueries: [[LIST_PRODUCTS_QUERY_KEY], [GET_PRODUCT_QUERY_KEY, product.code]]
    });

    return response;
  };

  return editProduct;
};

export function useProductsBySupplierId(supplierId) {
  const listBySupplierId = async () => {
    const { products } = await listItems({ entity: ENTITIES.PRODUCTS, url: PATHS.PRODUCTS, params: { sort: FILTERS_OPTIONS.DATE } });
    return products.filter((product) => product.code.startsWith(supplierId));
  }

  const query = useQuery({
    queryKey: [LIST_PRODUCTS_BY_SUPPLIER_QUERY_KEY, supplierId],
    queryFn: () => listBySupplierId(),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
}

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  const createBatch = async (products) => {
    const parsedProducts = products.map((product) => ({
      ...product,
      createdAt: now(),
    }));
    const chunks = chunk(parsedProducts, 500);
    let i = 25;
    const promises = chunks.map((chunk) => {
      const delay = Math.min(25000, 2 ** Math.log(i) * 100 + Math.random() * 100);
      i += i / 2;
      return new Promise((resolve) => setTimeout(resolve, delay)).then(() => {
        return axios.post(`${PATHS.PRODUCTS}/${BATCH}`, { products: chunk });
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

    console.log("Invalidando queries después de createBatch");
    const invalidateQueries = [
      [LIST_PRODUCTS_QUERY_KEY],
    ];
    invalidateQueries.forEach((query) => {
      queryClient.invalidateQueries({ queryKey: query, refetchType: ALL }); 
    });

    return { data };
  };

  return createBatch;
};

export const useEditBatch = () => {
  const queryClient = useQueryClient();

  const editBatch = async (products) => {
    const chunks = chunk(products, 100);
    let delay = 0;
    const delayIncrement = 1000;
    const promises = chunks.map((chunk) => {
      delay += delayIncrement;
      return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
        axios.post(`${PATHS.PRODUCTS}/${EDIT_BATCH}`, { update: chunk })
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

    const invalidateQueries = [
      [LIST_PRODUCTS_QUERY_KEY],
    ];
    invalidateQueries.forEach((query) => {
      queryClient.invalidateQueries({ queryKey: query, refetchType: ALL });
    });

    return Promise.resolve({ data });
  };

  return editBatch;
};

export function editBanProducts(products) {
  return axios.put(BLACK_LIST, products);
};

export const useDeleteBySupplierId = () => { 
  const queryClient = useQueryClient();

  const deleteBatchProducts = async (supplierId) => {

    const { data } = await axios.delete(`${PATHS.PRODUCTS}/${SUPPLIER}/${supplierId}`)
    if (data.statusOk) {
      await removeStorageItemsByCustomFilter({
        entity: ENTITIES.PRODUCTS, filter: ((product) => !product.code.startsWith(supplierId))
      })

      queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_BY_SUPPLIER_QUERY_KEY, supplierId], refetchType: ALL });
      queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY], refetchType: ALL });
      queryClient.invalidateQueries({ queryKey: [GET_PRODUCT_QUERY_KEY], refetchType: ALL });
    }

    return data;
  };

  return deleteBatchProducts;
};

export const useInactiveProduct = () => {
  const inactiveItem = useInactiveItem();

  const inactiveProduct = async (product, reason) => {
    const updatedProduct = {
      ...product,
      inactiveReason: reason
    }

    const response = await inactiveItem({
      entity: ENTITIES.PRODUCTS,
      url: `${PATHS.PRODUCTS}/${product.code}/${INACTIVE}`,
      value: updatedProduct,
      key: CODE,
      responseEntity: ENTITIES.PRODUCT,
      invalidateQueries: [[LIST_PRODUCTS_QUERY_KEY], [GET_PRODUCT_QUERY_KEY, product.code]]
    });

    return response;
  };

  return inactiveProduct;
};

export const useActiveProduct = () => {
  const activeItem = useActiveItem();

  const activeProduct = async (product) => {
    const updatedProduct = {
      ...product,
    }

    const response = await activeItem({
      entity: ENTITIES.PRODUCTS,
      url: `${PATHS.PRODUCTS}/${product.code}/${ACTIVE}`,
      value: updatedProduct,
      key: CODE,
      responseEntity: ENTITIES.PRODUCT,
      invalidateQueries: [[LIST_PRODUCTS_QUERY_KEY], [GET_PRODUCT_QUERY_KEY, product.code]]
    });

    return response;
  };

  return activeProduct;
};
