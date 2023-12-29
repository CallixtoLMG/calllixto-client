import { now } from "@/utils";
import { toast } from "react-hot-toast";
import axios from './axios';

export async function baseCreate(url, model, message) {
  let data;

  try {
    const response = await axios.post(url, { ...model, createdAt: now() });
    data = response.data;
  } catch (error) {
    console.error(error);
  }

  if (data.statusOk) {
    toast.success(message);
  } else {
    toast.error(data.message);
  }
};

export async function baseUpdate(url, model, message) {
  let data;

  try {
    const response = await axios.put(url, { ...model, updatedAt: now() });
    data = response.data;
  } catch (error) {
    console.error(error);
  }

  if (data.statusOk) {
    toast.success(message);
  } else {
    toast.error(data.message);
  }
};

export async function baseDelete(url, message) {
  let data;

  try {
    const response = await axios.delete(url);
    data = response.data;
  } catch (error) {
    console.error(error);
  }

  if (data.statusOk) {
    toast.success(message);
  } else {
    toast.error(data.message);
  };
};

export async function baseGet(url) {
  let data;

  try {
    const response = await axios.get(url);
    data = response.data;
  } catch (error) {
    console.error(error);
  }

  return data;
};
