import { CLIENT_ID, PATHS } from "@/fetchUrls";
import { omit } from "lodash";
import { baseCreate, baseDelete, baseUpdate } from "./base";
import { METHODS, useAxios } from "./axios";

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

export function useListSuppliers() {
  const { response, isLoading } = useAxios({ url: SUPPLIER_URL, method: METHODS.GET });
  return { suppliers: response?.suppliers, isLoading };
};

export function useGetSupplier(id) {
  const { response, isLoading } = useAxios({ url: `${SUPPLIER_URL}/${id}`, method: METHODS.GET });
  return { supplier: response?.supplier, isLoading };
};
