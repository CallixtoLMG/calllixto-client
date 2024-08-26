import { ENTITIES, TIME_IN_MS } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from '@tanstack/react-query';
import axios from './axios';
import { createItem, deleteItem, listItems, getItemById } from './common';

const BRANDS_URL = `${PATHS.BRANDS}`;
export const GET_BRAND_QUERY_KEY = 'getBrand';
export const LIST_BRANDS_QUERY_KEY = 'listBrands';

export function useListBrands() {
  const query = useQuery({
    queryKey: [LIST_BRANDS_QUERY_KEY],
    queryFn: () => listItems({ entity: ENTITIES.BRANDS, url: BRANDS_URL, params: { sort: 'name', order: true } }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetBrand(id) {
  const query = useQuery({
    queryKey: [GET_BRAND_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: BRANDS_URL, entity: ENTITIES.BRANDS }),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};

export function createBrand(brand) {
  return createItem({ entity: ENTITIES.BRANDS, url: BRANDS_URL, value: brand, responseEntity: 'brand' });
};

export function deleteBrand(id) {
  return deleteItem({ entity: ENTITIES.BRANDS, id, url: BRANDS_URL });
};

export function edit(brand) {
  const body = {
    ...brand,
    updatedAt: now()
  }
  return axios.put(`${BRANDS_URL}/${brand.id}`, body);
};
