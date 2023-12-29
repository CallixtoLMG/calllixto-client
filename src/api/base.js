import { createDate } from "@/utils";
import { getToken } from "@/hooks/userData";
import { toast } from "react-hot-toast";

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