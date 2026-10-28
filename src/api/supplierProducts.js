import { ENTITIES } from "@/common/constants";
import { LIST_PRODUCTS_QUERY_KEY } from "@/components/products/products.constants";
import { PATHS } from "@/fetchUrls";
import { listCatalogPages } from "./catalogLists";

export const SUPPLIER_PRODUCTS_STALE_TIME = 5 * 60 * 1000;

export const getSupplierProductsQueryKey = supplierId => [LIST_PRODUCTS_QUERY_KEY, "supplier-tools", supplierId];

export function getSupplierProductsQueryOptions(supplierId) {
  return {
    queryKey: getSupplierProductsQueryKey(supplierId),
    queryFn: ({ signal } = {}) => listCatalogPages({
      entity: ENTITIES.PRODUCTS, url: PATHS.PRODUCTS, params: { supplierId }, signal,
    }),
    staleTime: SUPPLIER_PRODUCTS_STALE_TIME,
    retry: false,
    refetchOnWindowFocus: false,
  };
}

export function loadSupplierProducts(queryClient, supplierId) {
  if (!supplierId) return Promise.reject(new Error("Proveedor inválido"));
  // fetchQuery reuses fresh, complete results and deduplicates in-flight loads.
  // Failed pages reject the entire query; no partial collection is published.
  return queryClient.fetchQuery(getSupplierProductsQueryOptions(supplierId));
}

export function invalidateSupplierProducts(queryClient, supplierId) {
  return queryClient.invalidateQueries({ queryKey: getSupplierProductsQueryKey(supplierId), refetchType: "none" });
}
