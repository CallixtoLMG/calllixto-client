import { ENTITIES, IN_MS } from "@/common/constants";
import { GET_PRODUCT_QUERY_KEY, GET_STOCK_FLOW_QUERY_KEY, LIST_PRODUCTS_QUERY_KEY } from "@/components/products/products.constants";
import { GET_SUPPLIER_QUERY_KEY } from "@/components/suppliers/suppliers.constants";
import { ADD, PATHS } from "@/fetchUrls";
import { useQuery } from "@tanstack/react-query";
import { getInstance } from "./axios";
import { useCreateItem, usePostUpdateItem } from "./common";

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
  });

  return query;
};

export const useCreateStockFlow = () => {
  const createItem = useCreateItem();

  return ({ product, ...stockFlow }) => {
    return createItem({
      entity: ENTITIES.STOCK_FLOWS,
      url: `/${PATHS.STOCK_FLOWS}/${product.id}`,
      value: stockFlow,
      skipStorageUpdate: true,
      responseEntity: ENTITIES.STOCK_FLOW,
      invalidateQueries: [
        [GET_STOCK_FLOW_QUERY_KEY, product.id],
      ],
    });
  };
};

export const useAddStock = () => {
  const updateItem = usePostUpdateItem();

  const addStock = ({ supplierId, inflow, flows, }) => {
    return updateItem({
      entity: ENTITIES.PRODUCTS,
      url: `/${PATHS.STOCK_FLOWS}/${supplierId}/${ADD}`,
      value: { inflow, flows, },
      responseEntity: null,
      skipStorageUpdate: true,
      invalidateQueries: [
        [LIST_PRODUCTS_QUERY_KEY], [GET_PRODUCT_QUERY_KEY]
        [GET_SUPPLIER_QUERY_KEY, supplierId],
      ],
    });
  };

  return addStock;
};

// ESTA NO LA TENGO ARMADA, ES UN ESQUELETO NOMAS
// export const useConsumeStock = () => {
//   const updateItem = usePostUpdateItem();

//   const consumeStock = ({ budgetId, flows, invalidateQueries = [], }) => {
//     return updateItem({
//       entity: ENTITIES.PRODUCTS,
//       url: `/${PATHS.STOCK_FLOWS}/${budgetId}/${CONSUME}`,
//       value: { flows },
//       responseEntity: null,
//       skipStorageUpdate: true,
//       invalidateQueries,
//     });
//   };

//   return consumeStock;
// };

