import { CLIENTID, PATHS, URL } from "@/fetchUrls";
// import { toast } from "react-hot-toast";

export async function loadCustomers() {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.CUSTOMERS}`, { cache: "no-store" });
  const data = await res.json()
  return data.customers
};