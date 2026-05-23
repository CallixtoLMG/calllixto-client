import { getServerEntityById } from "./server";

export const getBudgetById = async (id) => {
  const response = await getServerEntityById({
    id,
    path: "budgets",
    responseEntity: "budget",
  });

  if (!response.budget) {
    return response;
  }

  return {
    ...response,
    budget: {
      ...response.budget,
      globalDiscount: response.budget.globalDiscount ?? 0,
      additionalCharge: response.budget.additionalCharge ?? 0,
    },
  };
};
