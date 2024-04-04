import { usePaginationContext } from "@/components/common/table/Pagination";
import { DEFAULT_PAGE_SIZE, ENTITIES, TIME_IN_MS } from "@/constants";
import { CLIENT_ID, PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQuery } from '@tanstack/react-query';
import axios from './axios';

const BRANDS_URL = `${CLIENT_ID}${PATHS.BRANDS}`;
export const LIST_BRANDS_QUERY_KEY = 'listBrands';
export const GET_BRAND_QUERY_KEY = 'getBrand';
export const LIST_ALL_BRANDS_QUERY_KEY = 'listAllBrands';

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

export function useListBrands({ sort, order = true, pageSize = DEFAULT_PAGE_SIZE }) {
  const { addKey, currentPage, keys, filters } = usePaginationContext();

  const params = {
    pageSize,
    ...(keys[ENTITIES.BRANDS][currentPage] && {
      LastEvaluatedKey: encodeURIComponent(JSON.stringify(keys[ENTITIES.BRANDS][currentPage]))
    }),
    ...(sort && { sort }),
    order,
    ...filters
  };

  const listBrands = async (params) => {
    try {
      const { data } = await axios.get(BRANDS_URL, { params });
      if (data?.LastEvaluatedKey) {
        addKey(data?.LastEvaluatedKey, ENTITIES.BRANDS);
      }
      return { brands: data?.brands || [], LastEvaluatedKey: data.LastEvaluatedKey }
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_BRANDS_QUERY_KEY, params],
    queryFn: () => listBrands(params),
  });

  return query;
};

export function useListAllBrands() {
  const listBrands = async () => {
    try {
      let brands = [];
      let LastEvaluatedKey;

      do {
        const params = {
          pageSize: 1000,
          ...(LastEvaluatedKey && { LastEvaluatedKey: encodeURIComponent(JSON.stringify(LastEvaluatedKey)) }),
          attributes: ['code', 'name']
        };

        const { data } = await axios.get(BRANDS_URL, { params });

        if (data.statusOk) {
          brands = [...brands, ...data.brands];
        }

        LastEvaluatedKey = data?.LastEvaluatedKey;

      } while (LastEvaluatedKey);

      return { brands };
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [LIST_ALL_BRANDS_QUERY_KEY],
    queryFn: () => listBrands(),
    staleTime: TIME_IN_MS.FIVE_MINUTES,
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
