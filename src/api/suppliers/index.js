import { CLIENT_ID, PATHS, URL } from "@/fetchUrls";
import { omit } from "lodash";
import { baseCreate, baseDelete, baseGet, baseUpdate } from "../base";

const SUPPLIER_URL = `${CLIENT_ID}${PATHS.SUPPLIERS}`;

export async function create(supplier) {
  baseCreate(SUPPLIER_URL, supplier, 'Proveedor creado!');
};

export async function edit(supplier) {
  baseUpdate(`${SUPPLIER_URL}/${supplier.id}`, omit(supplier, ["id", "createdAt"]), 'Proveedor actualizado!');
};

export async function deleteSupplier(id) {
  baseDelete(`${SUPPLIER_URL}/${id}`, 'Proveedor eliminado!');
};

export async function list() {
  const { suppliers } = await baseGet(SUPPLIER_URL);
  return suppliers;
};

export async function getSupplier(id) {
  const { supplier } = await baseGet(`${SUPPLIER_URL}/${id}`);
  return supplier;
};
