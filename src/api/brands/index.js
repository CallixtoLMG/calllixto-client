import { CLIENT_ID, PATHS, URL } from "@/fetchUrls";
import { omit } from "lodash";
import { baseCreate, baseDelete, baseUpdate } from "../base";

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

export async function brandsList(requestOptions) {
  const res = await fetch(BRANDS_URL, requestOptions);
  const data = await res.json();
  return data.brands;
};

export async function getBrand(id, requestOptions) {
  const res = await fetch(`${BRANDS_URL}/${id}`, requestOptions);
  const data = await res.json();
  return data.brand;
};
