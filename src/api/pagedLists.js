import { getDefaultListParams } from "@/common/utils";
import { hashKey, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { getInstance } from "./axios";
import { buildListPageParams, LIST_PAGE_PARAMS, withListTotal } from "./listPagination";
import { fetchCountedListPage, getListCountState, getListDatasetKey, resetListCount } from "./listCounts";

// Exactly one GET for the requested page. No catalog storage synchronization.
export async function listPage({ entity, url, params }) {
  const { data } = await getInstance().get(url, { params: {
    ...params, [LIST_PAGE_PARAMS.count]: params?.[LIST_PAGE_PARAMS.count] ?? true,
  } });
  if (data?.statusOk === false) throw new Error(data.message || "Error al consultar listado");
  if (!Array.isArray(data?.[entity])) throw new Error(`Respuesta sin array ${entity}`);
  return data;
}

export function usePagedList({ entity, url, queryKey, attributes, params = {}, enabled = true, filterApplication = 0, ...pageOptions }) {
  const queryClient = useQueryClient();
  const requestParams = {
    ...(attributes ? getDefaultListParams(attributes) : {}),
    ...params,
    ...buildListPageParams(pageOptions),
  };
  delete requestParams[LIST_PAGE_PARAMS.count];
  const datasetKey = getListDatasetKey({ entity, url, params: requestParams });
  const activeDataset = useRef();
  const pageQueryKey = [queryKey, "page", requestParams];
  const pageHash = hashKey(pageQueryKey);
  const previousApplication = useRef({ filterApplication, pageHash });
  const applicationChanged = previousApplication.current.filterApplication !== filterApplication;
  const reapplySamePage = applicationChanged && previousApplication.current.pageHash === pageHash;
  if (activeDataset.current !== datasetKey || applicationChanged) {
    resetListCount(queryClient, datasetKey);
    activeDataset.current = datasetKey;
  }
  previousApplication.current = { filterApplication, pageHash };
  const query = useQuery({
    queryKey: pageQueryKey,
    queryFn: () => fetchCountedListPage({
      queryClient, entity, datasetKey, params: requestParams,
      fetchPage: countedParams => listPage({ entity, url, params: countedParams }),
    }),
    meta: { pagedListEntity: entity },
    staleTime: 0,
    enabled,
  });
  const { refetch } = query;
  useEffect(() => {
    // Changed keys already fetch once. An explicit Buscar/reset on the same
    // key needs one refetch, without introducing an application/count cache key.
    if (enabled && reapplySamePage) refetch();
  }, [enabled, filterApplication, reapplySamePage, refetch]);
  const { total } = getListCountState(queryClient, entity, datasetKey);
  const data = useMemo(() => withListTotal(query.data, total, requestParams.pageSize),
    [query.data, total, requestParams.pageSize]);
  return { ...query, data };
}
