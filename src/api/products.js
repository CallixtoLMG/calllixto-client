import { usePaginationContext } from "@/components/common/table/Pagination";
import { TIME_IN_MS } from "@/constants";
import { BATCH, BLACK_LIST, CLIENT, CLIENT_ID, EDIT_BATCH, PATHS, SUPPLIER } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';

const { omit, chunk } = require('lodash');

const PRODUCTS_URL = `${CLIENT_ID}${PATHS.PRODUCTS}`;
const BAN_PRODUCTS_URL = `${CLIENT_ID}${CLIENT}`;
export const LIST_PRODUCTS_QUERY_KEY = 'listProducts';
export const GET_PRODUCT_QUERY_KEY = 'getProduct';
export const LIST_BANNED_PRODUCTS_QUERY_KEY = 'listBannedProducts';

export function create(product) {
  const body = {
    ...product,
    createdAt: now()
  }
  return axios.post(PRODUCTS_URL, body);
};

export function edit(product) {
  const body = {
    ...omit(product, 'id'),
    updatedAt: now()
  }
  return axios.put(`${PRODUCTS_URL}/${product.code}`, body);
};

export function deleteProduct(id) {
  return axios.delete(`${PRODUCTS_URL}/${id}`);
};

export function useListProducts({ cache = true, sort, order = true, pageSize }) {
  const { nextKey, addNextKey, currentPage, previousKeys } = usePaginationContext();
  console.log("previousKeys", previousKeys)
  console.log("currentPage", currentPage)
  console.log("previousKeys[currentPage]", previousKeys[currentPage])
  console.log("nextKey", nextKey)

  const params = {
    pageSize: pageSize || "6",
    // ...(nextKey && { LastEvaluatedKey: nextKey }),
    ...(nextKey && { LastEvaluatedKey: previousKeys[currentPage] }),
    ...(sort && { sort }),
    ...(order && { order }),
  };


  const listProducts = async (params) => {
    try {
      const { data } = await axios.get(PRODUCTS_URL, { params });
      addNextKey(data.LastEvaluatedKey);
      return { products: data?.products || [], LastEvaluatedKey: data.LastEvaluatedKey };
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_PRODUCTS_QUERY_KEY, params],
    queryFn: () => listProducts(params),
    retry: false,
    staleTime: cache ? TIME_IN_MS.ONE_MINUTE : 0,
  });

  return query;
};

export function useGetProduct(id) {
  const getProduct = async (id) => {
    try {
      const { data } = await axios.get(`${PRODUCTS_URL}/${id}`);
      return data?.product;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_PRODUCT_QUERY_KEY, id],
    queryFn: () => getProduct(id),
    retry: false,
    staleTime: TIME_IN_MS.ONE_MINUTE,
  });

  return query;
};

export async function createBatch(products) {
  const parsedProducts = products.map(product => ({ ...product, createdAt: now() }));
  const chuncks = chunk(parsedProducts, 500);
  let delay = 0;
  const delayIncrement = 1000;
  const promises = chuncks.map(chunk => {
    delay += delayIncrement;
    return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
      axios.post(`${PRODUCTS_URL}/${BATCH}`, { products: chunk }));
  });

  const responses = await Promise.all(promises);

  const data = {
    statusOk: true, unprocessed: responses.map(response => {
      if (response?.data?.statusOk) {
        return response.data.unprocessed;
      }
      return [];
    }).flat()
  };

  return Promise.resolve({ data });
};

export function editBatch(products) {
  const body = {
    update: products.map(product => ({ ...product, updatedAt: now() }))
  }
  return axios.post(`${PRODUCTS_URL}/${EDIT_BATCH}`, body);
};

export function useListBanProducts() {
  const listBannedProducts = async () => {
    try {
      const { data } = await axios.get(BAN_PRODUCTS_URL);
      return data?.client?.blacklist || [];
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_BANNED_PRODUCTS_QUERY_KEY],
    queryFn: () => listBannedProducts(),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};

export function editBanProducts(products) {
  return axios.put(`${CLIENT_ID}${BLACK_LIST}`, products);
};

export function deleteBatchProducts(id) {
  return axios.delete(`${PRODUCTS_URL}/${SUPPLIER}/${id}`);
};
