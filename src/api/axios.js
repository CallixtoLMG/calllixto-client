import { DEFAULT_SELECTED_CLIENT } from "@/constants";
import axios from 'axios';
import { isCallixtoUser } from "../roles";

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const getClientId = () => {
  if (typeof window === 'undefined') return null;

  const userDataString = sessionStorage.getItem("userData");
  if (!userDataString) return null;

  try {
    const userData = JSON.parse(userDataString);

    if (isCallixtoUser(userData.clientId)) {
      return userData.selectedClientId || DEFAULT_SELECTED_CLIENT
    }
    return userData.clientId;
  } catch (e) {
    console.error("Error parsing userData from sessionStorage:", e);
    return null;
  };
};

export const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_URL}${getClientId()}`,
  timeout: 60000,
  headers: {
    authorization: `Bearer ${getToken()}`
  },
});

export default instance;
