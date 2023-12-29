import { createDate } from "@/utils";
import { toast } from "react-hot-toast";

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function baseCreate(url, model, message) {
  const requestOptions = {
    method: 'POST',
    body: JSON.stringify({ ...model, createdAt: createDate() }),
    redirect: "follow",
    headers: {
      authorization: `Bearer ${getToken()}`
    },
    cache: "no-store"
  };

  let response = await fetch(url, requestOptions);
  response = await response.text();
  response = JSON.parse(response);

  if (response.statusOk) {
    toast.success(message);
  } else {
    toast.error(response.message);
  }
};

export async function baseUpdate(url, model, message) {
  const requestOptions = {
    body: JSON.stringify({ ...model, updatedAt: createDate() }),
    method: 'PUT',
    redirect: 'follow',
    headers: {
      authorization: `Bearer ${getToken()}`
    },
    cache: "no-store",
  };

  let response = await fetch(url, requestOptions);
  response = await response.text();
  response = JSON.parse(response);

  if (response.statusOk) {
    toast.success(message);
  } else {
    toast.error(response.message);
  }
};

export async function baseDelete(url, message) {
  var requestOptions = {
    method: 'DELETE',
    redirect: 'follow',
    headers: {
      authorization: `Bearer ${getToken()}`
    },
    cache: "no-store",
  };

  let response = await fetch(url, requestOptions);
  response = await response.text();
  console.log({ response })
  response = JSON.parse(response);

  if (response.statusOk) {
    toast.success(message);
  } else {
    toast.error(response.message);
  };
};

export async function baseGet(url) {
  const requestOptions = {
    method: "GET",
    headers: {
      authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  };

  const res = await fetch(url, requestOptions);
  const data = await res.json();
  return data;
};