import { ATTRIBUTES } from "@/components/brands/brands.common";
import { ENTITIES, TIME_IN_MS } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { encodeUri } from "@/utils";
import { useQuery } from '@tanstack/react-query';
import { getItemById, listItems, useCreateItem, useDeleteItem, useEditItem } from './common';

export const GET_BRAND_QUERY_KEY = 'getBrand';
export const LIST_BRANDS_QUERY_KEY = 'listBrands';

export function useListBrands() {
  const query = useQuery({
    queryKey: [LIST_BRANDS_QUERY_KEY],
    queryFn: () => listItems({ entity: ENTITIES.BRANDS, url: PATHS.BRANDS, params: { sort: 'name', order: true, attributes: encodeUri(Object.values(ATTRIBUTES)) } }),
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
