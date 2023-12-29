import { CLIENT_ID, PATHS, URL } from "@/fetchUrls";
import { omit } from "lodash";
import { baseCreate, baseDelete, baseGet, baseUpdate } from "../base";

const CUSTOMERS_URL = `${URL}${CLIENT_ID}${PATHS.CUSTOMERS}`;

export async function create(customer) {
  baseCreate(CUSTOMERS_URL, customer, 'Cliente creado!');
};

export async function edit(customer) {
  baseUpdate(`${CUSTOMERS_URL}/${customer.id}`, omit(customer,["id", "createdAt"]), 'Cliente actualizado!');
};

export async function deleteCustomer(id) {
  baseDelete(`${CUSTOMERS_URL}/${id}`, 'Cliente eliminado!');
};

export async function list() {
  const { customers } = await baseGet(CUSTOMERS_URL);
  return customers;
};

export async function getCustomer(id) {
  const { customer } = await baseGet(`${CUSTOMERS_URL}/${id}`);
  return customer;
};
