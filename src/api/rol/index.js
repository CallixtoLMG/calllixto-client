import { URL, VALIDATE } from "@/fetchUrls";

export async function getUserRol() {
  const response = await fetch(`${URL}${VALIDATE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener la información del rol del usuario');
  };

  const data = await response.json();
  return data.roles[0];
};