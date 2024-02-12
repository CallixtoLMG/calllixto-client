import { CLIENT_ID, PATHS } from "@/fetchUrls";
import { useQuery } from '@tanstack/react-query';
import axios from './axios';
import { TIME_IN_MS } from "@/constants";
import { now } from "@/utils";

const BRANDS_URL = `${CLIENT_ID}${PATHS.BRANDS}`;
export const LIST_BRANDS_QUERY_KEY = 'listBrands';
export const GET_BRAND_QUERY_KEY = 'getBrand';

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

export function useListBrands() {
  const listBrands = async () => {
    try {
      const { data } = await axios.get(BRANDS_URL);
      return data?.brands || [];
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_BRANDS_QUERY_KEY],
    queryFn: () => listBrands(),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};

export function useGetBrand(id) {
  const getBrand = async (id) => {
    try {
      const { data } = await axios.get(`${BRANDS_URL}/${id}`);
      return data?.brand;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_BRAND_QUERY_KEY, id],
    queryFn: () => getBrand(id),
    retry: false,
    staleTime: TIME_IN_MS.ONE_HOUR,
  });

  return query;
};
