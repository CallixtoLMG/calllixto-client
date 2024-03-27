import { usePaginationContext } from "@/components/common/table/Pagination";
import { TIME_IN_MS } from "@/constants";
import { CLIENT_ID, PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from '@tanstack/react-query';
import { useEffect } from "react";
import axios from './axios';

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

export function useListBrands({ entityType = 'brands', cache = true, sort, order = true, pageSize, }) {
  const { addKey, currentPage, keys, filters, handleEntityChange } = usePaginationContext();

  useEffect(() => {
    handleEntityChange();
    // Dependencias del efecto, incluyendo `handleEntityChange` para asegurar su actualización
  }, [entityType]);

  const params = {
    pageSize: pageSize || "10",
    ...(keys[entityType][currentPage] && { LastEvaluatedKey: encodeURIComponent(JSON.stringify(keys[entityType][currentPage])) }),
    ...(sort && { sort }),
    ...(order && { order }),
    ...filters
  };

  const listBrands = async (params) => {
    try {
      const { data } = await axios.get(BRANDS_URL, { params });
      if (data?.LastEvaluatedKey) {
        addKey(entityType, data.LastEvaluatedKey, true);
      } else {
        addKey(entityType, null, false);
      }
      return { brands: data?.brands || [], LastEvaluatedKey: data.LastEvaluatedKey }
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_BRANDS_QUERY_KEY, params],
    queryFn: () => listBrands(params),
    retry: false,
    staleTime: cache ? TIME_IN_MS.ONE_MINUTE : 0,
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
