import { CLIENT_ID, CREATE_BATCH, EDIT_BATCH, PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { omit } from "lodash";
import { baseCreate, baseDelete, baseGet, baseUpdate } from "../base";

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

export async function list() {
  const { products } = await baseGet(PRODUCTS_URL);
  return products;
};

export async function getProduct(code) {
  const { product } = await baseGet(`${PRODUCTS_URL}/${code}`);
  return product;
};

export async function createBatch(products) {
  baseCreate(`${PRODUCTS_URL}/${CREATE_BATCH}`, products.map(product => ({ ...product, createdAt: now() })), 'Productos creados!');
}

export async function editBatch(products) {
  baseCreate(`${PRODUCTS_URL}/${EDIT_BATCH}`, products.map(product => ({ ...product, createdAt: now() })), 'Productos actualizados!');
}
