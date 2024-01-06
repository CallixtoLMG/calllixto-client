import { CLIENT_ID, CREATE_BATCH, EDIT_BATCH, PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { omit } from "lodash";
import { baseCreate, baseDelete, baseUpdate } from "./base";
import { METHODS, useAxios } from "./axios";

const PRODUCTS_URL = `${CLIENT_ID}${PATHS.PRODUCTS}`;

export async function create(product) {
  baseCreate(PRODUCTS_URL, product, 'Producto creado!');
};

export async function edit(product) {
  baseUpdate(`${PRODUCTS_URL}/${product.code}`, omit(product, ["code", "createdAt"]), 'Producto actualizado!');
};

export async function deleteProduct(id) {
  baseDelete(`${PRODUCTS_URL}/${id}`, 'Producto eliminado!');
};

export function useListProducts() {
  const { response, isLoading } = useAxios({ url: PRODUCTS_URL, method: METHODS.GET });
  return { products: response?.products, isLoading };
};

export function useGetProduct(code) {
  const { response, isLoading } = useAxios({ url: `${PRODUCTS_URL}/${code}`, method: METHODS.GET });
  return { product: response?.product, isLoading };
};

export async function createBatch(products) {
  baseCreate(`${PRODUCTS_URL}/${CREATE_BATCH}`, { products: products.map(product => ({ ...product, createdAt: now() })) }, 'Productos creados!', false);
}

export async function editBatch(products) {
  baseCreate(`${PRODUCTS_URL}/${EDIT_BATCH}`, { update: products.map(product => ({ ...product, updatedAt: now() })) }, 'Productos actualizados!', false);
}
