import { BATCH, BLACK_LIST, CLIENT, CLIENT_ID, EDIT_BATCH, PATHS, SUPPLIER } from "@/fetchUrls";
import { now } from "@/utils";
import { omit } from "lodash";
import { METHODS, useAxios } from "./axios";
import { baseCreate, baseDelete, baseUpdate } from "./base";

const PRODUCTS_URL = `${CLIENT_ID}${PATHS.PRODUCTS}`;
const BAN_PRODUCTS_URL = `${CLIENT_ID}${CLIENT}`;

export async function create(product) {
  baseCreate(PRODUCTS_URL, product, 'Producto creado!');
};

export async function edit(product) {
  await baseUpdate(`${PRODUCTS_URL}/${product.code}`, omit(product, ["code", "createdAt"]), 'Producto actualizado!');
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
  baseCreate(`${PRODUCTS_URL}/${BATCH}`, { products: products.map(product => ({ ...product, createdAt: now() })) }, 'Productos creados!', false);
};

export async function editBatch(products) {
  baseCreate(`${PRODUCTS_URL}/${EDIT_BATCH}`, { update: products.map(product => ({ ...product, updatedAt: now() })) }, 'Productos actualizados!', false);
};

export function useListBanProducts() {
  const { response, isLoading } = useAxios({ url: BAN_PRODUCTS_URL, method: METHODS.GET });
  return { blacklist: response?.client.blacklist, isLoading };
};

export async function editBanProducts(product) {
  await baseUpdate(`${CLIENT_ID}${BLACK_LIST}`, omit(product, ["createdAt"]), 'Lista actualizada!');
};

export async function deleteBatchProducts(id) {
  baseDelete(`${PRODUCTS_URL}/${SUPPLIER}/${id}`, 'Productos del proveedor eliminados!');
};
