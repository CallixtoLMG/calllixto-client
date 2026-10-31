import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getInstance } from "./axios";

export const serverListKeys = {
  counts: (entity) => ["serverLists", entity, "counts"],
  count: (entity, filters) => ["serverLists", entity, "counts", filters],
  pages: (entity) => ["serverLists", entity, "pages"],
  dataset: (entity, filters) => ["serverLists", entity, "pages", filters],
  page: ({ entity, filters, pageNumber, pageSize, sort, order }) => [
    "serverLists", entity, "pages", filters, { pageNumber, pageSize, sort, order },
  ],
};

const emptyCount = () => ({ total: null, version: 0 });

export const requestListPage = async ({
  entity, url, filters, pageNumber, pageSize, sort, order, count, signal,
}) => {
  const { data } = await getInstance().get(url, {
    params: { ...filters, pageNumber, pageSize, sort, order, count },
    signal,
  });

  if (!data?.statusOk || !Array.isArray(data[entity])) {
    throw new Error(data?.error?.message || data?.message || "No se pudo cargar el listado.");
  }

  const total = count ? Number(data.count) : null;
  if (count && (data.count == null || data.count === "" || !Number.isSafeInteger(total) || total < 0)) {
    throw new Error("El listado no devolvió un count válido.");
  }

  return { items: data[entity], total };
};

export const fetchServerListPage = async (queryClient, options) => {
  const countKey = serverListKeys.count(options.entity, options.filters);
  const countState = queryClient.getQueryData(countKey) ?? queryClient.setQueryData(countKey, emptyCount());
  const needsCount = countState.total === null;
  const result = await requestListPage({ ...options, count: needsCount });

  if (needsCount && !options.signal?.aborted && queryClient.getQueryData(countKey)?.version === countState.version) {
    queryClient.setQueryData(countKey, { total: result.total, version: countState.version });
  }

  return { items: result.items };
};

const resetCounts = (queryClient, queryKey) => {
  queryClient.setQueriesData({ queryKey }, (entry) => entry && ({ total: null, version: entry.version + 1 }));
};

export const refreshServerList = (queryClient, entity, state) => {
  const filters = state.appliedFilters;
  resetCounts(queryClient, serverListKeys.count(entity, filters));
  const queryKey = serverListKeys.dataset(entity, filters);
  void queryClient.cancelQueries({ queryKey });
  void queryClient.invalidateQueries({ queryKey, refetchType: "none" });
  return queryClient.invalidateQueries({ queryKey: serverListKeys.page({ ...state, entity, filters }), exact: true });
};

export const useRefreshServerList = (entity) => {
  const queryClient = useQueryClient();
  return useCallback((state) => refreshServerList(queryClient, entity, state), [queryClient, entity]);
};

export const invalidateServerLists = async (queryClient, entity) => {
  resetCounts(queryClient, serverListKeys.counts(entity));
  const queryKey = serverListKeys.pages(entity);
  await queryClient.cancelQueries({ queryKey });
  await queryClient.invalidateQueries({ queryKey });
};

export const serverListQueryOptions = (queryClient, { entity, url, appliedFilters, pageNumber, pageSize, sort, order, hydrated }) => {
  const options = { entity, url, filters: appliedFilters, pageNumber, pageSize, sort, order };
  return {
    queryKey: serverListKeys.page(options),
    queryFn: ({ signal }) => fetchServerListPage(queryClient, { ...options, signal }),
    enabled: hydrated,
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
  };
};

export const usePagedList = (state) => {
  const queryClient = useQueryClient();
  const countQuery = useQuery({
    queryKey: serverListKeys.count(state.entity, state.appliedFilters),
    queryFn: emptyCount,
    initialData: emptyCount,
    enabled: false,
  });
  const query = useQuery(serverListQueryOptions(queryClient, state));
  return { ...query, total: countQuery.data.total };
};

export const fetchAllListPages = async ({ pageSize = 500, ...options }) => {
  const firstPage = await requestListPage({ ...options, pageNumber: 1, pageSize, count: true });
  const items = [...firstPage.items];
  const totalPages = Math.ceil(firstPage.total / pageSize);

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
    const page = await requestListPage({ ...options, pageNumber, pageSize, count: false });
    items.push(...page.items);
  }

  if (items.length !== firstPage.total) {
    throw new Error("No se pudo obtener el listado completo para exportar.");
  }
  return items;
};
