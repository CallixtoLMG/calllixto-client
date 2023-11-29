import { CLIENTID, PATHS, URL } from "@/fetchUrls";
import { toast } from "react-hot-toast";

export async function budgetsList(requestOptions) {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.BUDGETS}`, requestOptions);
  const data = await res.json();
  return data.budgets;
};

export async function getBudget(id, requestOptions) {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.BUDGETS}/${id}`, requestOptions);
  const data = await res.json();
  return data.budget;
};

export async function create(budget) {
  var requestOptions = {
    method: 'POST',
    body: JSON.stringify(budget),
    redirect: "follow",
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`
    },
    cache: "no-store"
  };

  const response = await fetch(`${URL}${CLIENTID}${PATHS.BUDGETS}`, requestOptions);
  let res = await response.text();
  res = JSON.parse(res);
  if (res.statusOk) {
    toast.success("Presupuesto creado exitosamente");
  } else {
    toast.error(res.message);
  };
};