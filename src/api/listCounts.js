import { hashKey } from "@tanstack/react-query";
import { LIST_PAGE_PARAMS, readListTotal } from "./listPagination";

// Metadata only, in memory and scoped to the current QueryClient/session.
// No Dexie and no extra React Query entries for count=true versus count=false.
const stores = new WeakMap();
const PAGE_ONLY_PARAMS = new Set([...Object.values(LIST_PAGE_PARAMS), "attributes"]);

export function getListDatasetKey({ entity, url, params }) {
  return hashKey([entity, url, Object.fromEntries(
    Object.entries(params).filter(([key]) => !PAGE_ONLY_PARAMS.has(key))
  )]);
}

function getStore(queryClient) {
  let store = stores.get(queryClient);
  if (!store) {
    store = new Map();
    stores.set(queryClient, store);
    queryClient.getQueryCache().subscribe(event => {
      if (event.type === "removed" && !queryClient.getQueryCache().getAll().length) {
        store.clear();
        return;
      }
      // Existing CRUD/batch invalidations happen before React Query refetches.
      // Clear every filter/range for this entity, including sales/history.
      if (event.type !== "updated" || event.action?.type !== "invalidate") return;
      const entity = event.query.meta?.pagedListEntity;
      if (!entity) return;
      invalidateListCounts(queryClient, entity);
    });
  }
  return store;
}

export function resetListCount(queryClient, datasetKey) {
  getStore(queryClient).delete(datasetKey);
}

export function invalidateListCounts(queryClient, entity) {
  const store = getStore(queryClient);
  for (const [key, state] of store) if (state.entity === entity) store.delete(key);
}

export function getListCountState(queryClient, entity, datasetKey) {
  const store = getStore(queryClient);
  if (!store.has(datasetKey)) store.set(datasetKey, { entity, total: undefined });
  return store.get(datasetKey);
}

export async function fetchCountedListPage({ queryClient, entity, datasetKey, params, fetchPage }) {
  const store = getStore(queryClient);
  const state = getListCountState(queryClient, entity, datasetKey);
  const count = state.total === undefined;
  const response = await fetchPage({ ...params, [LIST_PAGE_PARAMS.count]: count });
  const total = readListTotal(response);
  // A response begun before invalidation/filter reset cannot revive stale totals.
  if (store.get(datasetKey) === state && total !== undefined) state.total = total;
  return response;
}
