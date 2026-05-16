import { PAGES } from "@/common/constants";
import { expireSession, getSelectedAccountId, getToken, getUserData } from "@/services/session";
import axios from 'axios';
import { isCallixtoUser } from "../roles";

const getAccountId = () => {
  if (typeof window === 'undefined') return null;

  const userData = getUserData();
  if (!userData) return null;

  const accountId = userData.accountId;

  if (isCallixtoUser(accountId)) {
    return getSelectedAccountId();
  }

  return accountId;
};

let axiosInstance = null;

export const getInstance = () => {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      timeout: 60000,
    });

    axiosInstance.interceptors.request.use((config) => {
      const token = getToken();
      const accountId = getAccountId();

      if (accountId) {
        config.baseURL = `${process.env.NEXT_PUBLIC_URL}${accountId}`;
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
