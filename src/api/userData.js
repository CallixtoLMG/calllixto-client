import { URL, VALIDATE } from "@/fetchUrls";
import { ROLES } from "@/roles";
import {
  clearSession,
  getSelectedAccountId,
  getUserData as getSessionUserData,
  getToken,
  setSelectedAccountId,
  setUserData as setSessionUserData,
} from "@/services/session";
import axios from "axios";

export async function getUserData() {
  const data = getSessionUserData();

  if (data) {
    setSelectedAccountData(data);
    return data;
  }

  const token = getToken();
  if (!token) {
    clearSession();
    return null;
  }

  try {
    const response = await axios({
      url: `${URL}${VALIDATE}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`
      }
    });

    if (response.data) {
      setSelectedAccountData(response.data);
      setSessionUserData(response.data);
      return response.data;
    }
  } catch (e) {
    console.error("Error fetching userData from server:", e);
    clearSession();
    return null;
  }
};

function setSelectedAccountData(data) {
  const role = data?.role ?? data?.roles?.[0];

  if (role === ROLES.CALLIXTO) {
    const selectedAccountId = getSelectedAccountId(data);
    const accounts = data?.accounts?.items ?? [];
    const selectedAccount = accounts.find(account => account.id === selectedAccountId);

    if (selectedAccountId) {
      setSelectedAccountId(selectedAccountId);
    }

    data.selectedAccount = selectedAccount ?? null;
  }
};
