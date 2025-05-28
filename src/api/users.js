import { ACTIVE, ENTITIES, INACTIVE, IN_MS, USERNAME } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { now } from "@/common/utils/dates";
import { ATTRIBUTES, GET_USER_QUERY_KEY, LIST_USERS_QUERY_KEY } from "@/components/users/users.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from '@tanstack/react-query';
import { getInstance } from "./axios";
import { listItems, useActiveItemByParam, useCreateItem, useDeleteItemByParam, useEditItemByParam, useInactiveItemByParam } from './common';

export function useListUsers() {
  const query = useQuery({
    queryKey: [LIST_USERS_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.USERS,
      url: PATHS.USERS,
      key: USERNAME,
      params: getDefaultListParams(ATTRIBUTES)
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

  return query
}

export const useCreateUser = () => {
  const createItem = useCreateItem();

  const createUser = async (user) => {
    const response = await createItem({
      entity: ENTITIES.USERS,
      url: PATHS.USER,
      value: user,
      responseEntity: ENTITIES.USER,
      invalidateQueries: [[LIST_USERS_QUERY_KEY]],
    });

    return response;
  };

  return createUser;
};

export const useEditUser = () => {
  const editItemByParam = useEditItemByParam();

  const editUser = async (user) => {
    const { previousVersions, ...cleanUser } = user;
    const response = await editItemByParam({
      entity: ENTITIES.USERS,
      url: PATHS.USER,
      value: cleanUser,
      username: user.username,
      responseEntity: ENTITIES.USER,
      invalidateQueries: [[LIST_USERS_QUERY_KEY], [GET_USER_QUERY_KEY, user.username]]
    });

    return response;
  };

  return editUser;
};

export const useDeleteUser = () => {
  const deleteItemByParam = useDeleteItemByParam();

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

export const useInactiveUser = () => {
  const inactiveItem = useInactiveItemByParam();

  const inactiveUser = async (username, reason) => {
    const response = await inactiveItem({
      entity: ENTITIES.USERS,
      url: `${PATHS.USER}/${INACTIVE}`,
      params: { username },
      value: {
        inactiveReason: reason,
        updatedAt: now(),
      },
      key: USERNAME,
      responseEntity: ENTITIES.USER,
      invalidateQueries: [[LIST_USERS_QUERY_KEY], [GET_USER_QUERY_KEY, username]]
    });

    return response;
  };

  return inactiveUser;
};

export const useActiveUser = () => {
  const activeItem = useActiveItemByParam();

  const activeUser = async (username) => {
    const response = await activeItem({
      entity: ENTITIES.USERS,
      url: `${PATHS.USER}/${ACTIVE}`,
      params: { username },
      value: { updatedAt: now() },
      key: USERNAME,
      responseEntity: ENTITIES.USER,
      invalidateQueries: [[LIST_USERS_QUERY_KEY], [GET_USER_QUERY_KEY, username]]
    });

    return response;
  };

  return activeUser;
};

