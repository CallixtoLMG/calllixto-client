import { CLIENTID, PATHS, URL } from "@/fetchUrls";
import { toast } from "react-hot-toast";

export async function customersList(requestOptions) {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.CUSTOMERS}`, requestOptions);
  const data = await res.json();
  return data.customers;
};

export async function getCustomer(id, requestOptions) {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.CUSTOMERS}/${id}`, requestOptions);
  const data = await res.json();
  return data.customers;
};

export async function deleteCustomer(id) {

  var requestOptions = {
    method: 'DELETE',
    redirect: 'follow',
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`
    },
    cache: "no-store",
  };

  await fetch(`${URL}${CLIENTID}${PATHS.CUSTOMERS}/${id}`, requestOptions)
    .then(async response => {
      let res = await response.text();
      res = JSON.parse(res);
      if (res.statusOk) {
        toast.success("Cliente eliminado exitosamente");
      } else {
        toast.error(res.message);
      };
    })
    .catch(error => console.log('error', error));
};

export async function create(customer) {
  var requestOptions = {
    method: 'POST',
    body: JSON.stringify(customer),
    redirect: "follow",
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`
    },
    cache: "no-store"
  };

  fetch(`${URL}${CLIENTID}${PATHS.CUSTOMERS}`, requestOptions)
    .then(async response => {
      let res = await response.text();
      res = JSON.parse(res);
      if (res.statusOk) {
        toast.success("Cliente creado exitosamente");
      } else {
        toast.error(res.message);
      };
    })
    .catch(error => console.log('error', error));
};

export async function edit(id, customer) {
  var requestOptions = {
    body: JSON.stringify(customer),
    method: 'PUT',
    redirect: 'follow',
    headers: {
      'Content-Type': 'application/json'
    },
    cache: "no-store",
  };

  fetch(`${URL}${CLIENTID}${PATHS.CUSTOMERS}/${id}`, requestOptions)
    .then(async response => {
      let res = await response.text();
      res = JSON.parse(res);
      if (res.statusOk) {
        toast.success("Cliente modificado exitosamente");
      } else {
        toast.error(res.message);
      };
    })
    .catch(error => console.log('error', error));
};