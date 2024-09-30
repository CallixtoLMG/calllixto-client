import { ATTRIBUTES } from "@/components/products/products.common";
import { ENTITIES, TIME_IN_MS } from "@/constants";
import {
  BATCH,
  BLACK_LIST,
  EDIT_BATCH,
  PATHS,
  SUPPLIER,
} from "@/fetchUrls";
import { encodeUri, now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { chunk } from "lodash";
import axios from "./axios";
import { getItemById, listItems, useCreateItem, useDeleteItem, useEditItem } from "./common";

export const LIST_PRODUCTS_QUERY_KEY = "listProducts";
export const LIST_PRODUCTS_BY_SUPPLIER_QUERY_KEY = "listProductsBySupplier";
export const GET_PRODUCT_QUERY_KEY = "getProduct";

export function useListProducts() {
  const query = useQuery({
    queryKey: [LIST_PRODUCTS_QUERY_KEY],
    queryFn: () => listItems({ entity: ENTITIES.PRODUCTS, url: PATHS.PRODUCTS, params: { attributes: encodeUri(Object.values(ATTRIBUTES)) } }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetProduct(id) {
  const query = useQuery({
    queryKey: [GET_PRODUCT_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: PATHS.PRODUCTS, entity: ENTITIES.PRODUCTS, key: 'code' }),
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
      key: "code",
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
      key: "code",
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
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
}

export async function createBatch(products) {
  const parsedProducts = products.map((product) => ({
    ...product,
    createdAt: now(),
  }));
  const chuncks = chunk(parsedProducts, 500);
  let i = 25;
  const promises = chuncks.map((chunk) => {
    const delay = Math.min(25000, 2 ** Math.log(i) * 100 + Math.random() * 100);
    i += i / 2
    return new Promise((resolve) => setTimeout(resolve, delay)).then(() => {
      return axios.post(`${PATHS.PRODUCTS}/${BATCH}`, { products: chunk });
    });
  });

  const responses = await Promise.all(promises);

  const data = {
    statusOk: true,
    unprocessed: responses
      .map((response) => {
        if (response?.data?.statusOk) {
          return response.data.unprocessed;
        }
        return [];
      })
      .flat()
      .filter((item) => item),
  };

  return Promise.resolve({ data });
};

export async function editBatch(products) {
  const chuncks = chunk(products, 100);
  let delay = 0;
  const delayIncrement = 1000;
  const promises = chuncks.map((chunk) => {
    delay += delayIncrement;
    return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
      axios.post(`${PATHS.PRODUCTS}/${EDIT_BATCH}`, { update: chunk }),
    );
  });

  const responses = await Promise.all(promises);

  const data = {
    statusOk: true,
    unprocessed: responses
      .map((response) => {
        if (response?.data?.statusOk) {
          return response.data.unprocessed;
        }
        return [];
      })
      .flat()
      .filter((item) => item),
  };

  return Promise.resolve({ data });
};

export function editBanProducts(products) {
  return axios.put(BLACK_LIST, products);
};

export function deleteBatchProducts(id) {
  return axios.delete(`${PATHS.PRODUCTS}/${SUPPLIER}/${id}`);
};
