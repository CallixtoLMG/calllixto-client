import { URL } from "@/fetchUrls";
import { getToken } from "@/services/session";
import axios from "axios";

export async function clearTestingTable() {
  const token = getToken();
  const { data } = await axios.post(`${URL}testing/clearTable`, undefined, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });

  return data;
}
