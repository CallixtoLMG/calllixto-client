import axios from 'axios';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getCallixtoClients = () => {
  if (typeof window === 'undefined') return null;

  const userDataString = sessionStorage.getItem("userData");
  if (!userDataString) return null;

  try {
    const userData = JSON.parse(userDataString);
    if (userData.clientId === "callixto" && Array.isArray(userData.callixtoClients)) {
      return userData.callixtoClients.map((client) => ({
        key: client,
        text: client,
        value: client,
      }));
    }
    return [];
  } catch (e) {
    console.error("Error parsing userData from sessionStorage:", e);
    return [];
  }
}

const getClientId = () => {
  if (typeof window === 'undefined') return null;

  const userDataString = sessionStorage.getItem("userData");
  if (!userDataString) return null;

  try {
    const userData = JSON.parse(userDataString);

    return userData.clientId;
  } catch (e) {
    console.error("Error parsing userData from sessionStorage:", e);
    return null;
  }
}

let instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL,
  timeout: 15000,
  headers: {
    authorization: `Bearer ${getToken()}`
  },
});

export const updateInstanceBaseURL = (clientId) => {
  instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_URL}${clientId}`,
    timeout: 15000,
    headers: {
      authorization: `Bearer ${getToken()}`
    },
  });
};

export default instance;
