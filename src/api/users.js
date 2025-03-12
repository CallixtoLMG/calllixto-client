import { ACTIVE, ENTITIES, INACTIVE, IN_MS } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { ATTRIBUTES, GET_USER_QUERY_KEY, LIST_USERS_QUERY_KEY } from "@/components/users/users.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from '@tanstack/react-query';
import { getItemById, listItems, useActiveItem, useCreateItem, useDeleteItem, useEditItem, useInactiveItem } from './common';

export function useListUsers() {
  const query = useQuery({
    queryKey: [LIST_USERS_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.USERS,
      url: PATHS.USERS,
      params: getDefaultListParams(ATTRIBUTES)
    }),
    staleTime: IN_MS.ONE_DAY,
  });
  return query;
};

export function useGetUser(id) {
  const query = useQuery({
    queryKey: [GET_USER_QUERY_KEY, id],
    queryFn: () => getItemById({ id, url: PATHS.USER, entity: ENTITIES.USERS }),
    retry: false,
    staleTime: IN_MS.ONE_HOUR,
  });

  return query;
};

export const useCreateUser = () => {
  const createItem = useCreateItem();

  const createUser = async (user) => {
    const response = await createItem({
      entity: ENTITIES.USER,
      url: PATHS.USER,
      value: user,
      responseEntity: ENTITIES.USER,
      invalidateQueries: [[LIST_USERS_QUERY_KEY]],
    });

    return response;
  };

  return createUser;
};

export const useDeleteUser = () => {
  const deleteItem = useDeleteItem();

  const deleteUser = async (id) => {
    const response = await deleteItem({
      entity: ENTITIES.USERS,
      id,
      url: PATHS.USERS,
      key: "id",
      invalidateQueries: [[LIST_USERS_QUERY_KEY]]
    });

    return response;
  };

  return deleteUser;
};

export const useEditUser = () => {
  const editItem = useEditItem();

  const editUser = async (user) => {
    const response = await editItem({
      entity: ENTITIES.USERS,
      url: `${PATHS.USERS}/${user.id}`,
      value: user,
      key: "id",
      responseEntity: ENTITIES.USER,
      invalidateQueries: [[LIST_USERS_QUERY_KEY], [GET_USER_QUERY_KEY, user.id]]
    });

    return response;
  };

  return editUser;
};


export const useInactiveUser = () => {
  const inactiveItem = useInactiveItem();

  const inactiveUser = async (user, reason) => {
    const updatedUser = {
      ...user,
      inactiveReason: reason
    }

    const response = await inactiveItem({
      entity: ENTITIES.USERS,
      url: `${PATHS.USERS}/${user.id}/${INACTIVE}`,
      value: updatedUser,
      responseEntity: ENTITIES.USER,
      invalidateQueries: [[LIST_USERS_QUERY_KEY], [GET_USER_QUERY_KEY, user.id]]
    });

    return response;
  };

  return inactiveUser;
};
export const useActiveUser = () => {
  const activeItem = useActiveItem();

  const activeUser = async (user) => {
    const updatedUser = {
      ...user,
    }

    const response = await activeItem({
      entity: ENTITIES.USERS,
      url: `${PATHS.USERS}/${user.id}/${ACTIVE}`,
      value: updatedUser,
      responseEntity: ENTITIES.USER,
      invalidateQueries: [[LIST_USERS_QUERY_KEY], [GET_USER_QUERY_KEY, user.id]]
    });

    return response;
  };

  return activeUser;
};
