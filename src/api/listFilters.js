// Temporary filter contract for the call. All new list parameters below need
// backend confirmation; matching an entity attribute does not prove support.
// Change queryParam here when the backend uses a different name.
const text = queryParam => ({ queryParam, type: "text", confirmed: false });
const selection = queryParam => ({ queryParam, type: "selection", confirmed: false });

export const LIST_FILTER_MAPPING = {
  budgets: {
    id: text("id"),
    customer: text("customerName"), // UI field is customer; retain backend parameter.
    createdBy: selection("createdBy"), // Current UI selects the seller's full name.
    state: selection("state"),
    paymentStatus: {
      ...selection("paymentStatus"),
      when: filters => filters.state === "CONFIRMED",
    },
  },
  products: { id: text("id"), name: text("name"), state: selection("state") },
  customers: { name: text("name"), state: selection("state") },
  suppliers: { id: text("id"), name: text("name"), state: selection("state") },
  users: {
    username: text("username"), // Known on /user; not verified on /users.
    firstName: text("firstName"),
    lastName: text("lastName"),
    state: selection("state"),
  },
  expenses: {
    id: text("id"), name: text("name"),
    categories: selection("categories"), // UI selects one category name.
    state: selection("state"),
  },
  cashBalances: {
    id: text("id"), paymentMethods: selection("paymentMethods"),
    state: selection("state"),
  },
  brands: { id: text("id"), name: text("name"), state: selection("state") },
};

export function toListFilterParams(entity, filters = {}) {
  return Object.fromEntries(
    Object.entries(LIST_FILTER_MAPPING[entity] ?? {}).flatMap(([field, config]) => {
      const value = filters[field];
      if (config.when && !config.when(filters)) return [];
      if (value == null || value === "" || value === "all") return [];
      if (Array.isArray(value) && value.length === 0) return [];
      return [[config.queryParam, value]];
    })
  );
}
