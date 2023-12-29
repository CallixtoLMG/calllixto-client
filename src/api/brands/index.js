import { CLIENT_ID, PATHS } from "@/fetchUrls";
import { omit } from "lodash";
import { baseCreate, baseDelete, baseUpdate } from "../base";
import { METHODS, useAxios } from "../axios";

const BRANDS_URL = `${CLIENT_ID}${PATHS.BRANDS}`;

export async function create(brand) {
  baseCreate(BRANDS_URL, brand, 'Marca creada!');
};

export async function edit(brand) {
  baseUpdate(`${BRANDS_URL}/${brand.id}`, omit(brand, ["id", "createdAt"]), 'Marca actualizada!');
};

export async function deleteBrand(id) {
  baseDelete(`${BRANDS_URL}/${id}`, 'Marca eliminada!');
};

export function useListBrands() {
  const { response, isLoading } = useAxios({ url: BRANDS_URL, method: METHODS.GET });
  return { brands: response?.brands, isLoading };
};

export function useGetBrand(id) {
  const { response, isLoading } = useAxios({ url: `${BRANDS_URL}/${id}`, method: METHODS.GET });
  return { brand: response?.brand, isLoading };
};
