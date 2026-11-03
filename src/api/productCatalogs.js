import { ENTITIES } from "@/common/constants";
import { getSupplierId } from "@/components/products/products.utils";
import { PATHS } from "@/fetchUrls";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchAllListPages, invalidateServerLists } from "./pagedLists";

export const productCatalogKeys = {
  all: ["productCatalog"],
  suppliers: ["supplierProducts"],
  supplier: (supplierId) => ["supplierProducts", supplierId],
};

export const productCatalogOptions = () => ({
  queryKey: productCatalogKeys.all,
  queryFn: async ({ signal }) => ({ products: await fetchAllListPages({
    entity: ENTITIES.PRODUCTS, url: PATHS.PRODUCTS, signal,
  }) }),
  staleTime: 5 * 60 * 1000,
  retry: false,
});

export const useProductCatalog = ({ enabled = true } = {}) => {
  const query = useQuery({ ...productCatalogOptions(), enabled });
  useEffect(() => {
    if (enabled && query.error) toast.error(query.error.message);
  }, [enabled, query.error]);
  return query;
};

export const supplierProductsOptions = (supplierId) => ({
  queryKey: productCatalogKeys.supplier(supplierId),
  queryFn: ({ signal }) => fetchAllListPages({
    entity: ENTITIES.PRODUCTS, url: PATHS.PRODUCTS, filters: { supplierId }, signal,
  }),
  staleTime: 5 * 60 * 1000,
  retry: false,
});

export const invalidateProductData = async (queryClient, { ids, supplierIds } = {}) => {
  const suppliers = supplierIds ?? (ids?.length ? [...new Set(ids.map(getSupplierId).filter(Boolean))] : null);
  const keys = [productCatalogKeys.all, ...(suppliers
    ? suppliers.map(productCatalogKeys.supplier) : [productCatalogKeys.suppliers])];
  await Promise.all(keys.map(async (queryKey) => {
    await queryClient.cancelQueries({ queryKey });
    await queryClient.invalidateQueries({ queryKey, refetchType: "none" });
  }));
  await invalidateServerLists(queryClient, ENTITIES.PRODUCTS);
};
