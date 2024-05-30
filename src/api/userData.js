import { URL, VALIDATE } from "@/fetchUrls";
import axios from "axios";

export async function getUserData() {
  let dataString = sessionStorage.getItem("userData");
  let data = null;

  if (dataString) {
    try {
      data = JSON.parse(dataString);
    } catch (e) {
      console.error("Error parsing userData from sessionStorage:", e);
      sessionStorage.removeItem("userData");
    }
  }

  if (data?.isAuthorized) {
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
      sessionStorage.setItem("userData", JSON.stringify(response.data));
      return response.data;
    }
  } catch (e) {
    console.error("Error fetching userData from server:", e);
    return null;
  }
};
