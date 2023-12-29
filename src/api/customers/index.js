import { CLIENT_ID, PATHS, URL } from "@/fetchUrls";
import { omit } from "lodash";
import { baseCreate, baseDelete, baseUpdate } from "../base";

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

export async function customersList(requestOptions) {
  const res = await fetch(CUSTOMERS_URL, requestOptions);
  const data = await res.json();
  return data.customers;
}

export async function getCustomer(id, requestOptions) {
  const res = await fetch(`${CUSTOMERS_URL}/${id}`, requestOptions);
  const data = await res.json();
  return data.customer;
}
