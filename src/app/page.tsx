"use client"
import { updateInstanceBaseURL } from '@/api/axios';
import React, { useEffect, useState } from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { Container, Subtitle, Title } from "./styles";

// Definir el tipo para las opciones del dropdown
interface DropdownOption {
  key: number;
  text: string;
  value: string;
}

// Función para obtener los clientes de Callixto
const getCallixtoClients = (): DropdownOption[] => {
  if (typeof window === 'undefined') return [];

  const userDataString = sessionStorage.getItem("userData");
  if (!userDataString) return [];

  try {
    const userData = JSON.parse(userDataString);
    if (userData.clientId === "callixto" && Array.isArray(userData.callixtoClients)) {
      return userData.callixtoClients.map((client: string, index: number) => ({
        key: index + 1,
        text: client,
        value: client,
      }));
    }
    return [];
  } catch (e) {
    console.error("Error parsing userData from sessionStorage:", e);
    return [];
  }
};

const Home: React.FC = () => {
  const [clientList, setClientList] = useState<DropdownOption[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const clients = getCallixtoClients();
      setClientList(clients);
    }
  }, []);

  const handleClientChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
    const selectedValue = data.value as string;
    setSelectedClient(selectedValue);
    updateInstanceBaseURL(selectedValue);
  };

  return (
    <Container>
      <Title>Bienvenido a Callixto!</Title>
      <Subtitle>Gracias por elegirnos. ¡Estamos encantados de ser parte de su viaje!</Subtitle>
      <Dropdown
        search
        selection
        options={clientList}
        placeholder='Elegir cliente'
        onChange={handleClientChange}
      />
      {selectedClient && (
        <p>Cliente seleccionado: {selectedClient}</p>
      )}
    </Container>
  );
};

export default Home;