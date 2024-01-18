import { CLIENT_ID, PATHS } from "@/fetchUrls";
import { METHODS, useAxios } from "./axios";
import { baseCreate } from "./base";

const BUDGETS_URL = `${CLIENT_ID}${PATHS.BUDGETS}`;

export async function create(budget) {
  baseCreate(BUDGETS_URL, budget, 'Presupuesto creado!');
};

export async function edit(budget, id) {
  baseCreate(`${BUDGETS_URL}/${id}`, budget, 'Presupuesto confirmado!');
};

export function useListBudgets() {
  const { response, isLoading } = useAxios({ url: BUDGETS_URL, method: METHODS.GET });
  return { budgets: response?.budgets, isLoading };
};

export function useGetBudget(id) {
  const { response, isLoading } = useAxios({ url: `${BUDGETS_URL}/${id}`, method: METHODS.GET });
  return { budget: response?.budget, isLoading };
};
