import { URL, VALIDATE } from "@/fetchUrls";
import axios from "axios";

export async function getUserData() {
  let data = sessionStorage.getItem("userData");

  if (data?.isAuthorized) {
    return data;
  };

  const { data: response} = await axios({
    url: `${URL}${VALIDATE}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  sessionStorage.setItem("userData", response);
  return response;
};