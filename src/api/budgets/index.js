import { CLIENT_ID, PATHS } from "@/fetchUrls";
import { baseCreate } from "../base";
import { METHODS, useAxios } from "../axios";

const BUDGETS_URL = `${CLIENT_ID}${PATHS.BUDGETS}`;

export async function create(budget) {
  baseCreate(BUDGETS_URL, budget, 'Presupuesto creado!');
};

export function useListBudgets() {
  const { response, isLoading } = useAxios({ url: BUDGETS_URL, method: METHODS.GET });
  return { budgets: response?.budgets, isLoading };
};

export function useGetBudget(id) {
  const { response, isLoading } = useAxios({ url: `${BUDGETS_URL}/${id}`, method: METHODS.GET });
  return { budget: response?.budget, isLoading };
};
