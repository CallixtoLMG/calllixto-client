import { ENTITIES, INACTIVE, IN_MS, SET_STATE } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { GET_BRAND_QUERY_KEY, LIST_ATTRIBUTES, LIST_BRANDS_QUERY_KEY } from "@/components/brands/brands.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getInstance } from "./axios";
import { listItems, useCreateItem, useDeleteItem, useEditItem, usePostUpdateItem } from './common';
import { fetchAllListPages, invalidateServerLists, usePagedList } from './pagedLists';

export const usePagedBrands = (state) => usePagedList({ ...state, entity: ENTITIES.BRANDS, url: PATHS.BRANDS });

export const fetchBrandsForExport = ({ appliedFilters, sort, order }) => fetchAllListPages({
  entity: ENTITIES.BRANDS, url: PATHS.BRANDS, filters: appliedFilters, sort, order,
});

export function useListBrands() {
  const query = useQuery({
    queryKey: [LIST_BRANDS_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.BRANDS,
      url: PATHS.BRANDS,
      params: getDefaultListParams(LIST_ATTRIBUTES)
    }),
    staleTime: IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetBrand(id) {
  const getBrand = async (id) => {
    try {
      const { data } = await getInstance().get(`${PATHS.BRANDS}/${id}`);
      return data?.brand ?? null;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_BRAND_QUERY_KEY, id],
    queryFn: () => getBrand(id),
    retry: false,
    staleTime: IN_MS.ONE_HOUR,
    enabled: !!id,
  });

  return query;
};

export const useCreateBrand = () => {
  const createItem = useCreateItem();
  const queryClient = useQueryClient();

  const createBrand = async (brand) => {
    const data = await createItem({
      entity: ENTITIES.BRANDS,
      url: PATHS.BRANDS,
      value: brand,
      responseEntity: ENTITIES.BRAND,
      invalidateQueries: [[LIST_BRANDS_QUERY_KEY]],
    });
    if (data?.statusOk) await invalidateServerLists(queryClient, ENTITIES.BRANDS);
    return data;
  };

  return createBrand;
};

export const useDeleteBrand = () => {
  const deleteItem = useDeleteItem();
  const queryClient = useQueryClient();

  const deleteBrand = async (id) => {
    const data = await deleteItem({
      entity: ENTITIES.BRANDS,
      id,
      url: `${PATHS.BRANDS}/${id}`,
      invalidateQueries: [[LIST_BRANDS_QUERY_KEY]]
    });
    if (data?.statusOk) await invalidateServerLists(queryClient, ENTITIES.BRANDS);
    return data;
  };

  return deleteBrand;
};

export const useEditBrand = () => {
  const editItem = useEditItem();
  const queryClient = useQueryClient();

  const editBrand = async (brand) => {
    const data = await editItem({
      entity: ENTITIES.BRANDS,
      url: `${PATHS.BRANDS}/${brand.id}`,
      value: brand,
      responseEntity: ENTITIES.BRAND,
      invalidateQueries: [[LIST_BRANDS_QUERY_KEY], [GET_BRAND_QUERY_KEY, brand.id]]
    });
    if (data?.statusOk) await invalidateServerLists(queryClient, ENTITIES.BRANDS);
    return data;
  };

  return editBrand;
};

export const useSetBrandState = () => {
  const updateItem = usePostUpdateItem();
  const queryClient = useQueryClient();

  const setBrandState = async ({ id, state, inactiveReason }) => {
    const data = await updateItem({
      entity: ENTITIES.BRANDS,
      url: `${PATHS.BRANDS}/${id}/${SET_STATE}`,
      value: {
        id,
        state,
        ...(state === INACTIVE && { inactiveReason }),
      },
      responseEntity: ENTITIES.BRAND,
      invalidateQueries: [
        [LIST_BRANDS_QUERY_KEY],
        [GET_BRAND_QUERY_KEY, id],
      ],
      attributes: LIST_ATTRIBUTES,
    });
    if (data?.statusOk) await invalidateServerLists(queryClient, ENTITIES.BRANDS);
    return data;
  };

  return setBrandState;
};

