import { DEFAULT_PAGE_SIZE, SORTING } from "@/common/constants";

// pageNumber/pageSize are the explicit request contract for this experiment.
// User confirmed the legacy sort/order contract: true = ASC, false = DESC.
export const LIST_PAGE_PARAMS = {
  pageNumber: "pageNumber", pageSize: "pageSize",
  sort: "sort", order: "order",
  count: "count",
};
export const LIST_SORT_DIRECTIONS = { [SORTING.ASC]: true, [SORTING.DESC]: false };

// Optional metadata candidates. Count/total normalization is shared by pages
// and complete catalog loads; screens do not duplicate response adaptation.
export const LIST_PAGE_RESPONSE_FIELDS = {
  total: "total", totalPages: "totalPages", pageNumber: "pageNumber",
  pageSize: "pageSize", hasNext: "hasNext",
};

// The response field is still unconfirmed. Keep aliases here, never in screens.
export const LIST_COUNT_RESPONSE_FIELDS = ["total", "count"];

const integer = (value, minimum) => {
  if (!["number", "string"].includes(typeof value) || (typeof value === "string" && !value.trim())) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum ? parsed : undefined;
};

export function getListPageState(filters = {}) {
  return {
    pageNumber: integer(filters.page, 1) ?? 1,
    pageSize: integer(filters.pageSize, 1) ?? DEFAULT_PAGE_SIZE,
    sorting: filters.sorting,
  };
}

export function buildListPageParams({ remoteFilters = {}, pageNumber, pageSize, sorting } = {}) {
  const params = {
    ...remoteFilters,
    [LIST_PAGE_PARAMS.pageNumber]: integer(pageNumber, 1) ?? 1,
    [LIST_PAGE_PARAMS.pageSize]: integer(pageSize, 1) ?? DEFAULT_PAGE_SIZE,
  };
  if (sorting?.key) {
    params[LIST_PAGE_PARAMS.sort] = sorting.key;
    const direction = LIST_SORT_DIRECTIONS[sorting.direction];
    if (direction !== undefined) params[LIST_PAGE_PARAMS.order] = direction;
  }
  return params;
}

export function readListTotal(response = {}) {
  for (const field of LIST_COUNT_RESPONSE_FIELDS) {
    const total = integer(response?.[field], 0);
    if (total !== undefined) return total;
  }
  return undefined;
}

export function withListTotal(response, total, pageSize) {
  if (!response) return response;
  const page = { ...response };
  for (const field of LIST_COUNT_RESPONSE_FIELDS) delete page[field];
  if (total === undefined && readListTotal(response) !== undefined) delete page.totalPages;
  if (total !== undefined) {
    page.total = total;
    page.totalPages = Math.ceil(total / (integer(page.pageSize, 1) ?? pageSize));
  }
  return page;
}

export function readListPagination(response = {}) {
  const pagination = {
    total: readListTotal(response),
    totalPages: integer(response?.[LIST_PAGE_RESPONSE_FIELDS.totalPages], 0),
    pageNumber: integer(response?.[LIST_PAGE_RESPONSE_FIELDS.pageNumber], 1),
    pageSize: integer(response?.[LIST_PAGE_RESPONSE_FIELDS.pageSize], 1),
    hasNext: typeof response?.[LIST_PAGE_RESPONSE_FIELDS.hasNext] === "boolean"
      ? response[LIST_PAGE_RESPONSE_FIELDS.hasNext] : undefined,
  };
  return Object.fromEntries(Object.entries(pagination).filter(([, value]) => value !== undefined));
}
