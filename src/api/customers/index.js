import { CLIENT_ID, PATHS, URL } from "@/fetchUrls";
import { createDate } from "@/utils";
import { toast } from "react-hot-toast";
import { omit } from "lodash";

const CUSTOMERS_URL = `${URL}${CLIENT_ID}${PATHS.CUSTOMERS}`;

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

export async function deleteCustomer(id) {
  var requestOptions = {
    method: "DELETE",
    redirect: "follow",
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    cache: "no-store",
  };

  await fetch(`${CUSTOMERS_URL}/${id}`, requestOptions)
    .then(async (response) => {
      let res = await response.text();
      res = JSON.parse(res);
      if (res.statusOk) {
        toast.success("Cliente eliminado exitosamente");
      } else {
        toast.error(res.message);
      }
    })
    .catch((error) => console.log("error", error));
}

export async function create(customer) {
  customer.createdAt = createDate();
  var requestOptions = {
    method: "POST",
    body: JSON.stringify(customer),
    redirect: "follow",
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    cache: "no-store",
  };

  fetch(CUSTOMERS_URL, requestOptions)
    .then(async (response) => {
      let res = await response.text();
      res = JSON.parse(res);
      if (res.statusOk) {
        toast.success("Cliente creado exitosamente");
      } else {
        toast.error(res.message);
      }
    })
    .catch((error) => console.log("error", error));
}

export async function edit(customer) {
  customer.updatedAt = createDate();
  const validParams = omit(customer,["id", "createdAt"])
  var requestOptions = {
    body: JSON.stringify(validParams),
    method: "PUT",
    redirect: "follow",
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    cache: "no-store",
  };

  fetch(`${CUSTOMERS_URL}/${customer.id}`, requestOptions)
    .then(async (response) => {
      let res = await response.text();
      res = JSON.parse(res);
      if (res.statusOk) {
        toast.success("Cliente modificado exitosamente");
      } else {
        toast.error(res.message);
      }
    })
    .catch((error) => console.log("error", error));
}
