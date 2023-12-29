import { CLIENT_ID, PATHS, URL } from "@/fetchUrls";
import { baseCreate, baseGet } from "../base";

const BUDGETS_URL = `${URL}${CLIENT_ID}${PATHS.BUDGETS}`;

export async function create(budget) {
  baseCreate(BUDGETS_URL, budget, 'Presupuesto creado!');
};

export async function list() {
  const { budgets } = await baseGet(BUDGETS_URL);
  return budgets;
};

export async function getBudget(id) {
  const { budget } = await baseGet(`${BUDGETS_URL}/${id}`);
  return budget;
};
