import { API_METHODS } from "@/constants";
import { createDate } from "@/utils";
import { toast } from "react-hot-toast";

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

const getRequestOptions = (method, body) => {
  return {
    method,
    body,
    redirect: "follow",
    headers: {
      authorization: `Bearer ${getToken()}`
    },
    cache: "no-store"
  };
}

export async function baseCreate(url, model, message) {
  const body = JSON.stringify({ ...model, createdAt: createDate() });

  let response = await fetch(url, getRequestOptions(API_METHODS.POST, body));
  response = await response.text();
  response = JSON.parse(response);

  if (response.statusOk) {
    toast.success(message);
  } else {
    toast.error(response.message);
  }
};

export async function baseUpdate(url, model, message) {
  const body = JSON.stringify({ ...model, updatedAt: createDate() });

  let response = await fetch(url, getRequestOptions(API_METHODS.PUT, body));
  response = await response.text();
  response = JSON.parse(response);

  if (response.statusOk) {
    toast.success(message);
  } else {
    toast.error(response.message);
  }
};

export async function baseDelete(url, message) {
  let response = await fetch(url, getRequestOptions(API_METHODS.DELETE));
  response = await response.text();
  response = JSON.parse(response);

  if (response.statusOk) {
    toast.success(message);
  } else {
    toast.error(response.message);
  };
};

export async function baseGet(url) {
  const res = await fetch(url, getRequestOptions(API_METHODS.GET));
  const data = await res.json();
  return data;
};