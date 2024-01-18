import { CLIENT_ID, PATHS } from "@/fetchUrls";
import { omit } from "lodash";
import { METHODS, useAxios } from "./axios";
import { baseCreate, baseDelete, baseUpdate } from "./base";

const CUSTOMERS_URL = `${CLIENT_ID}${PATHS.CUSTOMERS}`;

export async function create(customer) {
  await baseCreate(CUSTOMERS_URL, customer, 'Cliente creado!');
};

export async function edit(customer) {
  await baseUpdate(`${CUSTOMERS_URL}/${customer.id}`, omit(customer, ["id", "createdAt"]), 'Cliente actualizado!');
};

export async function deleteCustomer(id) {
  await baseDelete(`${CUSTOMERS_URL}/${id}`, 'Cliente eliminado!');
};

export function useListCustomers() {
  const { response, isLoading } = useAxios({ url: CUSTOMERS_URL, method: METHODS.GET });
  return { customers: response?.customers, isLoading };
};

export function useGetCustomer(id) {
  const { response, isLoading } = useAxios({ url: `${CUSTOMERS_URL}/${id}`, method: METHODS.GET });
  return { customer: response?.customer, isLoading };
};
