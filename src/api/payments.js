import { ENTITIES, IN_MS } from "@/common/constants";
import { GET_PAYMENT_QUERY_KEY } from "@/components/payments/payments.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInstance } from "./axios";
import { useCreateItem, useDeleteItem, useEditItem } from "./common";
import { invalidateServerLists } from "./pagedLists";

export const useEditPayment = () => {
  const queryClient = useQueryClient();
  const editItem = useEditItem();

  const editPayment = async (payment, entity, entityId) => {
    const response = await editItem({
      entity: ENTITIES.PAYMENTS,
      url: `${PATHS.PAYMENTS}/${entity}/${entityId}/${payment.id}`,
      value: payment,
      responseEntity: ENTITIES.PAYMENT,
      invalidateQueries: [
        [GET_PAYMENT_QUERY_KEY, entityId]
      ],
      skipStorageUpdate: true,
    });
    if (response?.statusOk && entity === ENTITIES.EXPENSE) await invalidateServerLists(queryClient, ENTITIES.EXPENSES);
    return response;
  };

  return editPayment;
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  const deleteItem = useDeleteItem();

  const deletePayment = async (paymentId, entity, entityId) => {
    const response = await deleteItem({
      entity: ENTITIES.PAYMENTS,
      id: paymentId,
      url: `${PATHS.PAYMENTS}/${entity}/${entityId}/${paymentId}`,
      invalidateQueries: [
        [GET_PAYMENT_QUERY_KEY, entityId], 
      ],
      skipStorageUpdate: true,
    });
    if (response?.statusOk && entity === ENTITIES.EXPENSE) await invalidateServerLists(queryClient, ENTITIES.EXPENSES);
    return response;
  };

  return deletePayment;
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const createItem = useCreateItem();

  const createPayment = async (payment, entity, entityId) => {
    const response = await createItem({
      entity: ENTITIES.PAYMENTS,
      url: `${PATHS.PAYMENTS}/${entity}/${entityId}`,
      value: payment,
      responseEntity: ENTITIES.PAYMENT,
      invalidateQueries: [[GET_PAYMENT_QUERY_KEY, entityId]],
      skipStorageUpdate: true
    });
    if (response?.statusOk && entity === ENTITIES.EXPENSE) await invalidateServerLists(queryClient, ENTITIES.EXPENSES);
    return response;
  };

  return createPayment;
};

export function useGetPayments(entity, entityId, { enabled = true } = {}) {
  const getPayment = async (entityId) => {
    try {
      const { data } = await getInstance().get(`${PATHS.PAYMENTS}/${entity}/${entityId}`);
      return data?.payments ?? null;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_PAYMENT_QUERY_KEY, entityId],
    queryFn: () => getPayment(entityId),
    retry: false,
    staleTime: IN_MS.ONE_HOUR,
    enabled: !!entityId && enabled,
  });

  return query;
};
