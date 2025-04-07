import { ACTIVE, ALL, CODE, ENTITIES, INACTIVE, IN_MS, RECOVER } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { now } from "@/common/utils/dates";
import { ATTRIBUTES, GET_PRODUCT_QUERY_KEY, LIST_PRODUCTS_BY_SUPPLIER_QUERY_KEY, LIST_PRODUCTS_QUERY_KEY } from "@/components/products/products.constants";
import {
  BATCH,
  EDIT_BATCH,
  PATHS,
  SUPPLIER
} from "@/fetchUrls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chunk } from "lodash";
import { useMemo } from "react";
import { getInstance } from "./axios";
import { getItemById, listItems, removeStorageItemsByCustomFilter, useActiveItem, useBatchDeleteItems, useCreateItem, useDeleteItem, useEditItem, useInactiveItem, useRecoverItem } from "./common";


export function useListProducts() {
  const query = useQuery({
    queryKey: [LIST_PRODUCTS_QUERY_KEY],
    queryFn: () => listItems({
      key: CODE,
      entity: ENTITIES.PRODUCTS,
      url: PATHS.PRODUCTS,
      params: getDefaultListParams(ATTRIBUTES)
    }),
    staleTime: IN_MS.ONE_DAY,
  });

  return query;
};

export function useHasProductsByBrandId(brandId) {
  const { data: productsData, isLoading: isLoadingProducts } = useListProducts();

  const hasAssociatedProducts = useMemo(() => {
    if (!productsData?.products || !brandId) return false;

    return productsData.products.some(product => {
      const brandCodeInProduct = product.code?.substring(2, 4);
      return brandCodeInProduct === String(brandId);
    });
  }, [productsData, brandId]);

  return { hasAssociatedProducts, isLoadingProducts };
}


export function useGetProduct(id) {
  const query = useQuery({
    queryKey: [GET_PRODUCT_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: PATHS.PRODUCTS, entity: ENTITIES.PRODUCTS, key: CODE }),
    retry: false,
    staleTime: IN_MS.ONE_DAY,
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

export const useBatchDeleteProducts = () => {
  const batchDeleteItems = useBatchDeleteItems();

  const batchDeleteProducts = async (codes) => {
    const responses = await batchDeleteItems({
      entity: ENTITIES.PRODUCTS,
      ids: codes,
      url: PATHS.PRODUCTS,
      key: CODE,
      invalidateQueries: [[LIST_PRODUCTS_QUERY_KEY]]
    });

    return responses;
  };

  return batchDeleteProducts;
};

export const useEditProduct = () => {
  const editItem = useEditItem();

  const editProduct = async (product) => {
    const { previousVersions, ...cleanProduct } = product;
    
    const response = await editItem({
      entity: ENTITIES.PRODUCTS,
      url: `${PATHS.PRODUCTS}/${product.code}`,
      value: cleanProduct,
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
    const { products } = await listItems({ entity: ENTITIES.PRODUCTS, url: PATHS.PRODUCTS, params: { sort: 'date' } });
    return products.filter((product) => product.code.startsWith(supplierId));
  }

  const query = useQuery({
    queryKey: [LIST_PRODUCTS_BY_SUPPLIER_QUERY_KEY, supplierId],
    queryFn: () => listBySupplierId(),
    staleTime: IN_MS.ONE_DAY,
  });

  return query;
}

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  const createBatch = async (products) => {
    const parsedProducts = products.map((product) => ({
      ...product,
      createdAt: now(),
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
      queryClient.invalidateQueries({ queryKey: [[LIST_PRODUCTS_QUERY_KEY]], refetchType: ALL })
    }

    return { data };
  };

  return createBatch;
};

export const useEditBatch = () => {
  const queryClient = useQueryClient();

  const editBatch = async (products, invalidateQueries = [[LIST_PRODUCTS_QUERY_KEY]]) => {
    const chunks = chunk(products, 100);
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

  const deleteBatchProducts = async (supplierId) => {

    const { data } = await getInstance().delete(`${PATHS.PRODUCTS}/${SUPPLIER}/${supplierId}`)
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
      code: product.code,
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
      code: product.code,
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

export const useRecoverProduct = () => {
  const recoverItem = useRecoverItem();

  const recoverProduct = async (product) => {

    const response = await recoverItem({
      entity: ENTITIES.PRODUCTS,
      url: `${PATHS.PRODUCTS}/${product.code}/${RECOVER}`,
      key: CODE,
      responseEntity: ENTITIES.PRODUCT,
      invalidateQueries: [[LIST_PRODUCTS_QUERY_KEY], [GET_PRODUCT_QUERY_KEY, product.code]]
    });

    return response;
  };

  return recoverProduct;
};

