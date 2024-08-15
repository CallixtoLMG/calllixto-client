import { ENTITIES, TIME_IN_MS } from "@/constants";
import {
  BATCH,
  BLACK_LIST,
  EDIT_BATCH,
  PATHS,
  SUPPLIER,
} from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "./axios";
import { getAllEntity } from "./common";
const { omit, chunk } = require("lodash");

const PRODUCTS_URL = `${PATHS.PRODUCTS}`;
export const LIST_ALL_PRODUCTS_QUERY_KEY = "listAllProducts";
export const GET_PRODUCT_QUERY_KEY = "getProduct";

export function create(product) {
  const body = {
    ...product,
    createdAt: now(),
  };
  return axios.post(PRODUCTS_URL, body);
};

export function edit(product) {
  const body = {
    ...omit(product, "id"),
    updatedAt: now(),
  };
  return axios.put(`${PRODUCTS_URL}/${product.code}`, body);
};

export function deleteProduct(id) {
  return axios.delete(`${PRODUCTS_URL}/${id}`);
};

export function useListAllProducts() {
  const query = useQuery({
    queryKey: [LIST_ALL_PRODUCTS_QUERY_KEY],
    queryFn: () => getAllEntity({ entity: ENTITIES.PRODUCTS, url: PRODUCTS_URL, params: { sort: 'date' } }),
    staleTime: TIME_IN_MS.ONE_DAY,
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
    };
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
      return axios.post(`${PRODUCTS_URL}/${BATCH}`, { products: chunk });
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
      axios.post(`${PRODUCTS_URL}/${EDIT_BATCH}`, { update: chunk }),
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
  return axios.delete(`${PRODUCTS_URL}/${SUPPLIER}/${id}`);
};
