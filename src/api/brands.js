import { ENTITIES, TIME_IN_MS } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from '@tanstack/react-query';
import axios from './axios';
import { createItem, deleteItem, getItemById, listItems } from './common';

export const GET_BRAND_QUERY_KEY = 'getBrand';
export const LIST_BRANDS_QUERY_KEY = 'listBrands';

export function useListBrands() {
  const query = useQuery({
    queryKey: [LIST_BRANDS_QUERY_KEY],
    queryFn: () => listItems({ entity: ENTITIES.BRANDS, url: PATHS.BRANDS, params: { sort: 'name', order: true } }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetBrand(id) {
  const query = useQuery({
    queryKey: [GET_BRAND_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: PATHS.BRANDS, entity: ENTITIES.BRANDS }),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};

export function createBrand(brand) {
  return createItem({ entity: ENTITIES.BRANDS, url: PATHS.BRANDS, value: brand, responseEntity: ENTITIES.BRAND });
};

export function deleteBrand(id) {
  return deleteItem({ entity: ENTITIES.BRANDS, id, url: PATHS.BRANDS });
};

export function edit(brand) {
  const body = {
    ...brand,
    updatedAt: now()
  }
  return axios.put(`${PATHS.BRANDS}/${brand.id}`, body);
};
