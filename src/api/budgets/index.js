import { CLIENT_ID, PATHS, URL } from "@/fetchUrls";
import { baseCreate } from "../base";

const BUDGETS_URL = `${URL}${CLIENT_ID}${PATHS.BUDGETS}`;

export async function create(budget) {
  baseCreate(BUDGETS_URL, budget, 'Presupuesto creado!');
};

export async function budgetsList(requestOptions) {
  const res = await fetch(BUDGETS_URL, requestOptions);
  const data = await res.json();
  return data.budgets;
}

export async function getBudget(id, requestOptions) {
  const res = await fetch(`${BUDGETS_URL}/${id}`, requestOptions);
  const data = await res.json();
  return data.budget;
}
