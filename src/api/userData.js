import { URL, VALIDATE } from "@/fetchUrls";
import { ROLES } from "@/roles";
import {
  clearSession,
  getSelectedClientId,
  getUserData as getSessionUserData,
  getToken,
  setUserData as setSessionUserData,
} from "@/services/session";
import axios from "axios";

export async function getUserData() {
  const data = getSessionUserData();

  if (data?.isAuthorized) {
    setSelectedClientData(data);
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
      setSelectedClientData(response.data);
      setSessionUserData(response.data);
      return response.data;
    }
  } catch (e) {
    console.error("Error fetching userData from server:", e);
    clearSession();
    return null;
  }
};

function setSelectedClientData(data) {
  if (data?.clientId === ROLES.CALLIXTO) {
    const selectedClientId = getSelectedClientId();
    const selectedClient = data?.callixtoClients?.items?.find(client => client.id === selectedClientId);
    data.selectedClient = selectedClient ?? null;
  }
};
