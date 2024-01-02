import { now } from "@/utils";
import { toast } from "react-hot-toast";
import { instance as axios } from './axios';

export const baseCreate = async (url, model, message, addCreatedDate = true) => {
  let data;

  try {
    const response = await axios.post(url, { ...model, ...(addCreatedDate && { createdAt: now() }) });
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

export const baseUpdate = async (url, model, message, addUpdatedDate) => {
  let data;

  try {
    const response = await axios.put(url, { ...model, ...(addUpdatedDate && { updatedAt: now() }) });
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

export const baseDelete = async (url, message) => {
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
