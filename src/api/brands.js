import { ENTITIES, TIME_IN_MS } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from '@tanstack/react-query';
import axios from './axios';
import { getAllEntity, getEntityById } from './common';

const BRANDS_URL = `${PATHS.BRANDS}`;

export const GET_BRAND_QUERY_KEY = 'getBrand';
export const LIST_BRANDS_QUERY_KEY = 'listBrands';

export function create(brand) {
  const body = {
    ...brand,
    createdAt: now()
  }
  return axios.post(BRANDS_URL, body);
};

export function edit(brand) {
  const body = {
    ...brand,
    updatedAt: now()
  }
  return axios.put(`${BRANDS_URL}/${brand.id}`, body);
};

export function deleteBrand(id) {
  return axios.delete(`${BRANDS_URL}/${id}`);
};

export function useListAllBrands() {
  const query = useQuery({
    queryKey: [LIST_BRANDS_QUERY_KEY],
    queryFn: () => getAllEntity({ entity: ENTITIES.BRANDS, url: BRANDS_URL, params: { sort: 'name', order: true } }),
    staleTime: TIME_IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetBrand(id) {
  const query = useQuery({
    queryKey: [GET_BRAND_QUERY_KEY, id],
    queryFn: () => getEntityById({ id, url: BRANDS_URL, entity: ENTITIES.BRANDS }),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};
