import { ENTITIES, IN_MS } from "@/common/constants";
import { GET_STOCK_FLOW_QUERY_KEY } from "@/components/products/products.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from "@tanstack/react-query";
import { getInstance } from "./axios";
import { useCreateItem } from "./common";

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

