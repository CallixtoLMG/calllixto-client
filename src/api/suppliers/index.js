import { CLIENT_ID, PATHS, URL } from "@/fetchUrls";
import { omit } from "lodash";
import { baseCreate, baseDelete, baseUpdate } from "../base";

const SUPPLIER_URL = `${URL}${CLIENT_ID}${PATHS.SUPPLIERS}`;

export async function create(supplier) {
  baseCreate(SUPPLIER_URL, supplier, 'Proveedor creado!');
};

export async function edit(supplier) {
  baseUpdate(`${SUPPLIER_URL}/${supplier.id}`, omit(supplier, ["id", "createdAt"]), 'Proveedor actualizado!');
};

export async function deleteSupplier(id) {
  baseDelete(`${SUPPLIER_URL}/${id}`, 'Proveedor eliminado!');
};

export async function suppliersList(requestOptions) {
  const res = await fetch(SUPPLIER_URL, requestOptions);
  const data = await res.json();
  return data.suppliers;
};

export async function getSupplier(id, requestOptions) {
  const res = await fetch(`${SUPPLIER_URL}/${id}`, requestOptions);
  const data = await res.json();
  return data.supplier;
};
