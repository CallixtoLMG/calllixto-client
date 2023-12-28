import { URL, VALIDATE } from "@/fetchUrls";

export async function getUserData() {
  let data = sessionStorage.getItem("userData");
  if (data?.isAuthorized) {
    return data;
  };

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

  data = await response.json();
  sessionStorage.setItem("userData", data);
  return data;
};