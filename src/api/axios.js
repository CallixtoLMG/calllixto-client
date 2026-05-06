import { PAGES } from "@/common/constants";
import { expireSession, getSelectedClientId, getToken, getUserData } from "@/services/session";
import axios from 'axios';
import { isCallixtoUser } from "../roles";

const getClientId = () => {
  if (typeof window === 'undefined') return null;

  const userData = getUserData();
  if (!userData) return null;

  if (isCallixtoUser(userData.clientId)) {
    return getSelectedClientId();
  }

  return userData.clientId;
};

let axiosInstance = null;

export const getInstance = () => {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      timeout: 60000,
    });

    axiosInstance.interceptors.request.use((config) => {
      const token = getToken();
      const clientId = getClientId();

      if (clientId) {
        config.baseURL = `${process.env.NEXT_PUBLIC_URL}${clientId}`;
      }

      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }

      return config;
    });

    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;

        if ([401, 403].includes(status) && typeof window !== "undefined") {
          expireSession();

          if (window.location.pathname !== PAGES.LOGIN.BASE) {
            window.location.replace(PAGES.LOGIN.BASE);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  return axiosInstance;
};
