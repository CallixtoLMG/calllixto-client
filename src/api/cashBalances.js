import { ENTITIES, IN_MS } from "@/common/constants";
import { getDefaultListParams } from "@/common/utils";
import { GET_CASH_BALANCE_QUERY_KEY, LIST_ATTRIBUTES, LIST_CASH_BALANCES_QUERY_KEY } from "@/components/cashBalances/cashBalances.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from '@tanstack/react-query';
import { getInstance } from "./axios";
import { listItems, useCreateItem, useDeleteItem, useEditItem, usePostUpdateItem } from './common';

export function useListCashBalances() {
  const query = useQuery({
    queryKey: [LIST_CASH_BALANCES_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.CASHBALANCES,
      url: PATHS.CASH_BALANCES,
      params: getDefaultListParams(LIST_ATTRIBUTES)
    }),
    staleTime: IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetCashBalance(id) {
  const getCashBalance = async (id) => {
    try {
      const { data } = await getInstance().get(`${PATHS.CASH_BALANCES}/${id}`);

      return data?.cashBalance ?? null;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_CASH_BALANCE_QUERY_KEY, id],
    queryFn: () => getCashBalance(id),
    retry: false,
    staleTime: IN_MS.ONE_HOUR,
    enabled: !!id,
  });

  return query;
};

export const useCreateCashBalance = () => {
  const createItem = useCreateItem();

  const createCashBalance = async (cashBalance) => {
    return createItem({
      entity: ENTITIES.CASHBALANCES,
      url: PATHS.CASH_BALANCES,
      value: cashBalance,
      responseEntity: ENTITIES.CASHBALANCE,
      invalidateQueries: [[LIST_CASH_BALANCES_QUERY_KEY]],
    });
  };

  return createCashBalance;
};

export const useDeleteCashBalance = () => {
  const deleteItem = useDeleteItem();

  const deleteCashBalance = (id) => {
    return deleteItem({
      entity: ENTITIES.CASHBALANCES,
      id,
      url: `${PATHS.CASH_BALANCES}/${id}`,
      invalidateQueries: [[LIST_CASH_BALANCES_QUERY_KEY]]
    });
  };

  return deleteCashBalance;
};

export const useEditCashBalance = () => {
  const editItem = useEditItem();

  const editCashBalance = async (cashBalance) => {
    const response = await editItem({
      entity: ENTITIES.CASHBALANCES,
      url: `${PATHS.CASH_BALANCES}/${cashBalance.id}`,
      value: cashBalance,
      key: "id",
      responseEntity: ENTITIES.CASHBALANCE,
      invalidateQueries: [[LIST_CASH_BALANCES_QUERY_KEY], [GET_CASH_BALANCE_QUERY_KEY, cashBalance.id]]
    });

    return response;
  };

  return editCashBalance;
};

export const useCloseCashBalance = () => {
  const closeItem = usePostUpdateItem();

  const closeCashBalance = async (cashBalance) => {
    const response = await closeItem({
      entity: ENTITIES.CASHBALANCES,
      url: `${PATHS.CASH_BALANCES}/${cashBalance.id}`,
      value: cashBalance,
      responseEntity: ENTITIES.CASHBALANCE,
      invalidateQueries: [[LIST_CASH_BALANCES_QUERY_KEY], [GET_CASH_BALANCE_QUERY_KEY, cashBalance.id]]
    });

    return response;
  };

  return closeCashBalance;
};