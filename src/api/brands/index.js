import { CLIENT_ID, PATHS, URL } from "@/fetchUrls";
import { omit } from "lodash";
import { baseCreate, baseDelete, baseGet, baseUpdate } from "../base";

const BRANDS_URL = `${URL}${CLIENT_ID}${PATHS.BRANDS}`;

export async function create(brand) {
  baseCreate(BRANDS_URL, brand, 'Marca creada!');
};

export async function edit(brand) {
  baseUpdate(`${BRANDS_URL}/${brand.id}`, omit(brand,["id", "createdAt"]), 'Marca actualizada!');
};

export async function deleteBrand(id) {
  baseDelete(`${BRANDS_URL}/${id}`, 'Marca eliminada!');
};

export async function list() {
  const { brands } = await baseGet(BRANDS_URL);
  return brands;
};

export async function getBrand(id) {
  const { brand } = await baseGet(`${BRANDS_URL}/${id}`);
  return brand;
};
