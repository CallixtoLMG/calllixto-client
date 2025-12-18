import { ENTITIES, IN_MS } from "@/common/constants";
import { GET_PAYMENT_QUERY_KEY, LIST_PAYMENTS_QUERY_KEY } from "@/components/payments/payments.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from "@tanstack/react-query";
import { getInstance } from "./axios";
import { useCreateItem, useDeleteItem, useEditItem } from "./common";

export const useEditPayment = () => {
  const editItem = useEditItem();

  const editPayment = (payment, entity, entityId, options = {}) => {
    return editItem({
      entity: ENTITIES.PAYMENTS,
      url: `${PATHS.PAYMENTS}/${entity}/${entityId}/${payment.id}`,
      value: payment,
      responseEntity: ENTITIES.PAYMENT,
      invalidateQueries: [
        [LIST_PAYMENTS_QUERY_KEY],
        [GET_PAYMENT_QUERY_KEY, payment.id],
      ],
      ...options,
    });
  };

  return editPayment;
};

export const useDeletePayment = () => {
  const deleteItem = useDeleteItem();

  const deletePayment = ({ paymentId, entity, entityId }, options = {}) => {

    return deleteItem({
      entity: ENTITIES.PAYMENTS,
      id: paymentId,
      url: `${PATHS.PAYMENTS}/${entity}/${entityId}/${paymentId}`,
      invalidateQueries: [[LIST_PAYMENTS_QUERY_KEY]],
      ...options
    });
  };

  return deletePayment;
};

export const useCreatePayment = () => {
  const createItem = useCreateItem();

  const createPayment = (payment, entity, entityId, options = {}) => {
    return createItem({
      entity: ENTITIES.PAYMENTS,
      url: `${PATHS.PAYMENTS}/${entity}/${entityId}`,
      value: payment,
      responseEntity: ENTITIES.PAYMENT,
      invalidateQueries: [[LIST_PAYMENTS_QUERY_KEY]],
      ...options
    });
  };

  return createPayment;
};

export function useGetPayment(entity, entityId, enabled) {
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
    enabled: enabled && !!entityId,
  });

  return query;
};