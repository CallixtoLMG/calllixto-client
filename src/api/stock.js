import { ENTITIES, IN_MS } from "@/common/constants";
import { GET_BUDGET_QUERY_KEY, LIST_BUDGETS_QUERY_KEY } from "@/components/budgets/budgets.constants";
import { GET_PRODUCT_QUERY_KEY, GET_STOCK_FLOW_QUERY_KEY, LIST_STOCK_FLOWS_QUERY_KEY } from "@/components/products/products.constants";
import { GET_SUPPLIER_QUERY_KEY } from "@/components/suppliers/suppliers.constants";
import { ADD, CONSUME, PATHS } from "@/fetchUrls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInstance } from "./axios";
import { invalidateProductData } from "./productCatalogs";
import { useCreateItem, useInvalidateQueries, usePostUpdateItem } from "./common";

export const MAX_STOCK_BATCH_FLOWS = 250;
export const MAX_STOCK_TRANSACTION_OPERATIONS = 500;

export const buildSupplierStockBatches = (flows = []) => {
  if (!Array.isArray(flows) || flows.length === 0) return [];

  const batches = [];
  let batch = [];
  let productIds = new Set();

  const getOperationCount = (nextProductId) => {
    const productCost = productIds.has(nextProductId) ? 0 : 1;
    return batch.length + productIds.size + 1 + productCost;
  };

  const flushBatch = () => {
    if (!batch.length) return;
    batches.push(batch);
    batch = [];
    productIds = new Set();
  };

  flows.forEach((flow) => {
    const productId = flow?.productId;

    if (batch.length && (
      batch.length >= MAX_STOCK_BATCH_FLOWS ||
      getOperationCount(productId) > MAX_STOCK_TRANSACTION_OPERATIONS
    )) {
      flushBatch();
    }

    batch.push(flow);
    productIds.add(productId);
  });

  flushBatch();

  return batches;
};

export const postSupplierStockBatches = async ({
  supplierId,
  inflow,
  flows,
  post,
}) => {
  const batches = buildSupplierStockBatches(flows);
  let lastResponse = { statusOk: true };

  for (const batch of batches) {
    const { data } = await post(`/${PATHS.STOCK_FLOWS}/${supplierId}/${ADD}`, {
      inflow,
      flows: batch,
    });

    if (!data?.statusOk) {
      return data;
    }

    lastResponse = data;
  }

  return lastResponse;
};

export function useGetStockFlow(productId, { enabled = true } = {}) {
  const getStockFlow = async () => {
    const { data } = await getInstance().get(`${PATHS.STOCK_FLOWS}/${productId}`);
    return data?.stockFlows ?? [];
  };

  const query = useQuery({
    queryKey: [GET_STOCK_FLOW_QUERY_KEY, productId],
    queryFn: getStockFlow,
    retry: false,
    staleTime: IN_MS.ONE_HOUR,
    enabled: !!productId && enabled,
    enabled: !!productId && enabled,
  });

  return query;
};

export const useCreateStockFlow = () => {
  const queryClient = useQueryClient();
  const createItem = useCreateItem();

  return async ({ product, ...stockFlow }) => {
    const data = await createItem({
      entity: ENTITIES.STOCK_FLOWS,
      url: `/${PATHS.STOCK_FLOWS}/${product.id}`,
      value: stockFlow,
      skipStorageUpdate: true,
      responseEntity: ENTITIES.STOCK_FLOW,
      invalidateQueries: [
        [GET_STOCK_FLOW_QUERY_KEY, product.id],
        [GET_PRODUCT_QUERY_KEY, product.id],
      ],
    });
    if (data?.statusOk) await invalidateProductData(queryClient, { ids: [product.id] });
    return data;
  };
};

export const useAddSupplierStock = () => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateQueries();

  const addSupplierStock = async ({ supplierId, inflow, flows, }) => {
    const hasFlows = Array.isArray(flows) && flows.length > 0;
    const data = await postSupplierStockBatches({
      supplierId,
      inflow,
      flows,
      post: (...args) => getInstance().post(...args),
    }).finally(async () => {
      if (hasFlows) {
        await invalidateProductData(queryClient, { supplierIds: [supplierId] });
        invalidate([[GET_PRODUCT_QUERY_KEY], [GET_SUPPLIER_QUERY_KEY, supplierId]]);
      }
    });

    return data;
  };

  return addSupplierStock;
};

export const useConsumeStock = () => {
  const queryClient = useQueryClient();
  const updateItem = usePostUpdateItem();

  const consumeStock = async ({ budgetId, flows, inflow, deliveryNote }) => {
    const data = await updateItem({
      entity: ENTITIES.PRODUCTS,
      url: `/${PATHS.STOCK_FLOWS}/${budgetId}/${CONSUME}`,
      value: {
        deliveryNote,
        inflow,
        flows,
      },
      responseEntity: null,
      skipStorageUpdate: true,
      invalidateQueries: [
        [GET_BUDGET_QUERY_KEY, budgetId],
        [LIST_BUDGETS_QUERY_KEY],
        [LIST_STOCK_FLOWS_QUERY_KEY, budgetId],
      ],
    });
    if (data?.statusOk && flows?.length) await invalidateProductData(queryClient, { ids: flows.map((flow) => flow.productId) });
    return data;
  };

  return consumeStock;
};

export function useListStockFlowsByBudget({ budgetId, enabled = true } = {}) {

  return useQuery({
    queryKey: [LIST_STOCK_FLOWS_QUERY_KEY, budgetId],
    queryFn: async () => {
      const { data } = await getInstance().get(PATHS.STOCK_FLOWS, {
        params: {
          sort: "budgetId",
          budgetId,
        },
      });

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.stockFlows)) return data.stockFlows;
      if (data?.statusOk && data?.stockFlows == null) return [];

      throw new Error("Respuesta inválida de movimientos de stock por venta.");
    },
    enabled: !!budgetId && enabled,
    staleTime: IN_MS.ONE_HOUR,
  });
};
