import { CLIENTID, PATHS, URL } from "@/fetchUrls";
import { toast } from "react-hot-toast";

export async function loadBudgets() {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.BUDGETS}`, { cache: "no-store" });
  const data = await res.json()
  return data
};

export async function create(budget) {
  var requestOptions = {
    method: 'POST',
    body: JSON.stringify(budget),
    redirect: "follow",
    Headers: {
      'Content-type': 'application-json'
    },
    cache: "no-store"
  };

  const response = await fetch(`${URL}${CLIENTID}${PATHS.BUDGETS}`, requestOptions);
  let res = await response.text()
  res = JSON.parse(res)
  if (res.statusOk) {
    toast.success("Presupuesto creado exitosamente");
  } else {
    toast.error(res.message);
  };
};