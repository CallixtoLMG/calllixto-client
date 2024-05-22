import { useEffect, useState } from 'react';

export const useCallixtoClients = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userDataString = sessionStorage.getItem("userData");
    if (!userDataString) return;

    try {
      const userData = JSON.parse(userDataString);
      if (userData.clientId === "callixto" && Array.isArray(userData.callixtoClients)) {
        const formattedClients = userData.callixtoClients.map((client) => ({
          key: client,
          text: client,
          value: client,
        }));
        setClients(formattedClients);
      } else {
        setClients([]);
      }
    } catch (e) {
      console.error("Error parsing userData from sessionStorage:", e);
      setClients([]);
    }
  }, []); 

  return [clients];
};