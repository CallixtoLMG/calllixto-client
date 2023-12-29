import { getUserData } from "@/api/userData";
import { PATHS, URL } from "@/fetchUrls";
import axios from "axios";

export async function login(data) {
  const { data: response } = await axios.post(`${URL}${PATHS.LOGIN}`, data);
  if (response.$metadata?.httpStatusCode) {
    const accessToken = response.AuthenticationResult.AccessToken;
    localStorage.setItem("token", accessToken);
    await getUserData();
    return true;
  }
  return false;
};
