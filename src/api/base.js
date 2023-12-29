import { now } from "@/utils";
import { toast } from "react-hot-toast";
import axios from './axios';

export async function baseCreate(url, model, message) {
  const response = await axios.post(url, { ...model, createdAt: now() });

  if (response.data.statusOk) {
    toast.success(message);
  } else {
    toast.error(response.message);
  }
};

export async function baseUpdate(url, model, message) {
  const response = await axios.put(url, { ...model, updatedAt: now() });

  if (response.data.statusOk) {
    toast.success(message);
  } else {
    toast.error(response.message);
  }
};

export async function baseDelete(url, message) {
  const response = await axios.delete(url);

  if (response.data.statusOk) {
    toast.success(message);
  } else {
    toast.error(response.message);
  };
};

export async function baseGet(url) {
  const response = await axios.get(url);
  return response.data;
};
