import { USER_DATA_KEY } from "@/common/constants";
import { URL, VALIDATE } from "@/fetchUrls";
import axios from "axios";

export async function getUserData() {
  let dataString = localStorage.getItem(USER_DATA_KEY);
  let data = null;

  if (dataString) {
    try {
      data = JSON.parse(dataString);
    } catch (e) {
      console.error("Error parsing userData from localStorage:", e);
      localStorage.removeItem(USER_DATA_KEY);
    }
  }

  if (data?.isAuthorized) {
    setSelectedClientData(data);
    return data;
  }

  try {
    const response = await axios({
      url: `${URL}${VALIDATE}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    if (response.data) {
      setSelectedClientData(response.data);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data));
      return response.data;
    }
  } catch (e) {
    console.error("Error fetching userData from server:", e);
    return null;
  }
};

function setSelectedClientData(data) {
  if (data?.clientId === 'callixto') {
    const selectedClientId = localStorage.getItem('selectedClientId');
    const selectedClient = data?.callixtoClients?.items?.find(client => client.id === selectedClientId);
    data.selectedClient = selectedClient ?? null;
  }
};
