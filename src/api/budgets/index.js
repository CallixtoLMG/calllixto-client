import { CLIENT_ID, PATHS, URL } from "@/fetchUrls";
import { toast } from "react-hot-toast";
import { createDate } from "@/utils";

const BRANDS_URL = `${URL}${CLIENT_ID}${PATHS.BUDGETS}`;

export async function budgetsList(requestOptions) {
  const res = await fetch(BRANDS_URL, requestOptions);
  const data = await res.json();
  return data.budgets;
}

export async function getBudget(id, requestOptions) {
  const res = await fetch(`${BRANDS_URL}/${id}`, requestOptions);
  const data = await res.json();
  return data.budget;
}

export async function create(budget) {
  budget.createdAt = createDate();
  var requestOptions = {
    method: "POST",
    body: JSON.stringify(budget),
    redirect: "follow",
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    cache: "no-store",
  };

  const response = await fetch(BRANDS_URL, requestOptions);
  let res = await response.text();
  res = JSON.parse(res);
  if (res.statusOk) {
    toast.success("Presupuesto creado exitosamente");
  } else {
    toast.error(res.message);
  }
}
