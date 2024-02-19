import { BATCH, BLACK_LIST, CLIENT, CLIENT_ID, EDIT_BATCH, PATHS, SUPPLIER } from "@/fetchUrls";
import { now } from "@/utils";
import axios from './axios';
import { useQuery } from "@tanstack/react-query";
import { TIME_IN_MS } from "@/constants";
const { omit } = require('lodash');

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

export function useListProducts({ cache = true, sort, order = true }) {
  const listProducts = async () => {
    const params = {
      ...(sort && { sort }),
      ...(order && { order }),
    };

    try {
      const { data } = await axios.get(PRODUCTS_URL, { params });
      return data?.products || [];
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_PRODUCTS_QUERY_KEY],
    queryFn: () => listProducts(),
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

export function createBatch(products) {
  const body = {
    products: products.map(product => ({ ...product, createdAt: now() }))
  }
  return axios.post(`${PRODUCTS_URL}/${BATCH}`, body);
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
