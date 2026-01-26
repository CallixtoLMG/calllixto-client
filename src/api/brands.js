import { ENTITIES, INACTIVE, IN_MS, SET_STATE } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { GET_BRAND_QUERY_KEY, LIST_ATTRIBUTES, LIST_BRANDS_QUERY_KEY } from "@/components/brands/brands.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from '@tanstack/react-query';
import { getInstance } from "./axios";
import { listItems, useCreateItem, useDeleteItem, useEditItem, usePostUpdateItem } from './common';

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

  const createBrand = (brand) => {
    return createItem({
      entity: ENTITIES.BRANDS,
      url: PATHS.BRANDS,
      value: brand,
      responseEntity: ENTITIES.BRAND,
      invalidateQueries: [[LIST_BRANDS_QUERY_KEY]],
    });
  };

  return createBrand;
};

export const useDeleteBrand = () => {
  const deleteItem = useDeleteItem();

  const deleteBrand = (id) => {
    return deleteItem({
      entity: ENTITIES.BRANDS,
      id,
      url: `${PATHS.BRANDS}/${id}`,
      invalidateQueries: [[LIST_BRANDS_QUERY_KEY]]
    });
  };

  return deleteBrand;
};

export const useEditBrand = () => {
  const editItem = useEditItem();

  const editBrand = (brand) => {
    return editItem({
      entity: ENTITIES.BRANDS,
      url: `${PATHS.BRANDS}/${brand.id}`,
      value: brand,
      responseEntity: ENTITIES.BRAND,
      invalidateQueries: [[LIST_BRANDS_QUERY_KEY], [GET_BRAND_QUERY_KEY, brand.id]]
    });
  };

  return editBrand;
};

export const useSetBrandState = () => {
  const updateItem = usePostUpdateItem();

  const setBrandState = ({ id, state, inactiveReason }) => {
    return updateItem({
      entity: ENTITIES.BRANDS,
      url: `${PATHS.BRANDS}/${id}/${SET_STATE}`,
      value: {
        id,
        state,
        ...(state === INACTIVE && inactiveReason
          ? { inactiveReason }
          : {}),
      },
      responseEntity: ENTITIES.BRAND,
      invalidateQueries: [
        [LIST_BRANDS_QUERY_KEY],
        [GET_BRAND_QUERY_KEY, id],
      ],
      attributes: LIST_ATTRIBUTES,
    });
  };

  return setBrandState;
};

