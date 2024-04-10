import { usePaginationContext } from "@/components/common/table/Pagination";
import { DEFAULT_PAGE_SIZE, ENTITIES, TIME_IN_MS } from "@/constants";
import { BATCH, BLACK_LIST, CLIENT, CLIENT_ID, EDIT_BATCH, PATHS, SUPPLIER } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from './axios';

const { omit, chunk } = require('lodash');

const PRODUCTS_URL = `${CLIENT_ID}${PATHS.PRODUCTS}`;
const BAN_PRODUCTS_URL = `${CLIENT_ID}${CLIENT}`;
export const LIST_PRODUCTS_QUERY_KEY = 'listProducts';
export const LIST_ALL_PRODUCTS_QUERY_KEY = 'listAllProducts';
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

export function useListProducts({ sort, order = true, pageSize = DEFAULT_PAGE_SIZE, attributes = [] }) {
  const { addKey, currentPage, keys, filters } = usePaginationContext();

  const params = {
    attributes: encodeURIComponent(JSON.stringify(attributes)),
    pageSize,
    ...(keys[ENTITIES.PRODUCTS][currentPage] && {
      LastEvaluatedKey: encodeURIComponent(JSON.stringify(keys[ENTITIES.PRODUCTS][currentPage]))
    }),
    ...(sort && { sort }),
    order,
    ...filters
  };

  const listProducts = async (params) => {
    try {
      const { data } = await axios.get(PRODUCTS_URL, { params });
      if (data?.LastEvaluatedKey) {
        addKey(data?.LastEvaluatedKey, ENTITIES.PRODUCTS);
      }
      return { products: data?.products || [], LastEvaluatedKey: data.LastEvaluatedKey };
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_PRODUCTS_QUERY_KEY, params],
    queryFn: () => listProducts(params),
  });

  return query;
};

export function useListAllProducts({ attributes = [], enabled = false } = {}) {
  const listProducts = async () => {
    try {
      let products = [];
      let LastEvaluatedKey;

      do {
        const params = {
          attributes: encodeURIComponent(JSON.stringify(attributes)),
          ...(LastEvaluatedKey && { LastEvaluatedKey: encodeURIComponent(JSON.stringify(LastEvaluatedKey)) }),
        };

        const { data } = await axios.get(PRODUCTS_URL, { params });

        if (data.statusOk) {
          products = [...products, ...data.products];
        }

        LastEvaluatedKey = data?.LastEvaluatedKey;

      } while (LastEvaluatedKey);

      return { products };
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_ALL_PRODUCTS_QUERY_KEY, attributes],
    queryFn: () => listProducts(),
    staleTime: TIME_IN_MS.FIVE_MINUTES,
    enabled,
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
    }).flat().filter(item => item)
  };

  return Promise.resolve({ data });
};

export async function editBatch(products) {
  const chuncks = chunk(products, 100);
  let delay = 0;
  const delayIncrement = 1000;
  const promises = chuncks.map(chunk => {
    delay += delayIncrement;
    return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
      axios.post(`${PRODUCTS_URL}/${EDIT_BATCH}`, { update: chunk }));
  });

  const responses = await Promise.all(promises);

  const data = {
    statusOk: true, unprocessed: responses.map(response => {
      if (response?.data?.statusOk) {
        return response.data.unprocessed;
      }
      return [];
    }).flat().filter(item => item)
  };

  return Promise.resolve({ data });
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
