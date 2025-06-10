import { ACTIVE, ENTITIES, INACTIVE, IN_MS } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { ATTRIBUTES, GET_BRAND_QUERY_KEY, LIST_BRANDS_QUERY_KEY } from "@/components/brands/brands.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from '@tanstack/react-query';
import { getInstance } from "./axios";
import { listItems, useActiveItem, useCreateItem, useDeleteItem, useEditItem, useInactiveItem } from './common';

export function useListBrands({ sort = 'name', order = true } = {}) {
  const query = useQuery({
    queryKey: [LIST_BRANDS_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.BRANDS,
      url: PATHS.BRANDS,
      params: getDefaultListParams(ATTRIBUTES, sort, order)
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

  const createBrand = async (brand) => {
    const response = await createItem({
      entity: ENTITIES.BRANDS,
      url: PATHS.BRANDS,
      value: brand,
      responseEntity: ENTITIES.BRAND,
      invalidateQueries: [[LIST_BRANDS_QUERY_KEY]],
    });

    return response;
  };

  return createBrand;
};

export const useDeleteBrand = () => {
  const deleteItem = useDeleteItem();

  const deleteBrand = async (id) => {
    const response = await deleteItem({
      entity: ENTITIES.BRANDS,
      id,
      url: PATHS.BRANDS,
      key: "id",
      invalidateQueries: [[LIST_BRANDS_QUERY_KEY]]
    });

    return response;
  };

  return deleteBrand;
};

export const useEditBrand = () => {
  const editItem = useEditItem();

  const editBrand = async (brand) => {
    const response = await editItem({
      entity: ENTITIES.BRANDS,
      url: `${PATHS.BRANDS}/${brand.id}`,
      value: brand,
      key: "id",
      responseEntity: ENTITIES.BRAND,
      invalidateQueries: [[LIST_BRANDS_QUERY_KEY], [GET_BRAND_QUERY_KEY, brand.id]]
    });

    return response;
  };

  return editBrand;
};


export const useInactiveBrand = () => {
  const inactiveItem = useInactiveItem();

  const inactiveBrand = async (brand, reason) => {
    const updatedBrand = {
      id: brand.id,
      inactiveReason: reason
    }

    const response = await inactiveItem({
      entity: ENTITIES.BRANDS,
      url: `${PATHS.BRANDS}/${brand.id}/${INACTIVE}`,
      value: updatedBrand,
      responseEntity: ENTITIES.BRAND,
      invalidateQueries: [[LIST_BRANDS_QUERY_KEY], [GET_BRAND_QUERY_KEY, brand.id]]
    });

    return response;
  };

  return inactiveBrand;
};
export const useActiveBrand = () => {
  const activeItem = useActiveItem();

  const activeBrand = async (brand) => {
    const updatedBrand = {
      id: brand.id,
    }

    const response = await activeItem({
      entity: ENTITIES.BRANDS,
      url: `${PATHS.BRANDS}/${brand.id}/${ACTIVE}`,
      value: updatedBrand,
      responseEntity: ENTITIES.BRAND,
      invalidateQueries: [[LIST_BRANDS_QUERY_KEY], [GET_BRAND_QUERY_KEY, brand.id]]
    });

    return response;
  };

  return activeBrand;
};

