import { ENTITIES, INACTIVE, IN_MS, SET_STATE } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { GET_USER_QUERY_KEY, LIST_ATTRIBUTES, LIST_USERS_QUERY_KEY, MAIN_KEY } from "@/components/users/users.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from '@tanstack/react-query';
import { getInstance } from "./axios";
import { listItems, useCreateItem, useDeleteItem, useEditItem, usePostUpdateItem } from './common';

export function useListUsers() {
  const query = useQuery({
    queryKey: [LIST_USERS_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.USERS,
      url: PATHS.USERS,
      key: MAIN_KEY,
      params: getDefaultListParams(LIST_ATTRIBUTES)
    }),
    staleTime: IN_MS.ONE_DAY,
  });
  return query;
};

export function useGetUser(username) {

  const getUser = async (username) => {
    try {
      const { data } = await getInstance().get(PATHS.USER, {
        params: { username },
      });

      return data?.user ?? null;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_USER_QUERY_KEY, username],
    queryFn: () => getUser(username),
    retry: false,
    staleTime: IN_MS.ONE_HOUR,
    enabled: !!username,
  });

  return query;
}

export const useCreateUser = () => {
  const createItem = useCreateItem();

  const createUser = (user) => {
    return createItem({
      entity: ENTITIES.USERS,
      url: PATHS.USER,
      value: user,
      responseEntity: ENTITIES.USER,
      invalidateQueries: [[LIST_USERS_QUERY_KEY]],
    });
  };

  return createUser;
};

export const useEditUser = () => {
  const editItemByParam = useEditItem();

  const editUser = async (user) => {
    const { previousVersions, ...cleanUser } = user;
    const response = await editItemByParam({
      entity: ENTITIES.USERS,
      url: PATHS.USER,
      value: cleanUser,
      params: { username: user.username },
      responseEntity: ENTITIES.USER,
      invalidateQueries: [[LIST_USERS_QUERY_KEY], [GET_USER_QUERY_KEY, user.username]]
    });

    return response;
  };

  return editUser;
};

export const useDeleteUser = () => {
  const deleteItemByParam = useDeleteItem();

  const deleteUser = async (username) => {
    return await deleteItemByParam({
      entity: ENTITIES.USERS,
      url: PATHS.USER,
      params: { username },
      invalidateQueries: [[LIST_USERS_QUERY_KEY]]
    });
  };

  return deleteUser;
};

export const useSetUserState = () => {
  const updateItem = usePostUpdateItem();

  const setUserState = ({ username, state, inactiveReason }) => {
    return updateItem({
      entity: ENTITIES.USERS,
      url: `${PATHS.USER}/${SET_STATE}`,
      params: { username },
      value: {
        state,
        ...(state === INACTIVE && { inactiveReason }),
      },
      responseEntity: ENTITIES.USER,
      invalidateQueries: [
        [LIST_USERS_QUERY_KEY],
        [GET_USER_QUERY_KEY, username],
      ],
      attributes: LIST_ATTRIBUTES,
    });
  };

  return setUserState;
};
