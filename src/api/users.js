import { ACTIVE, ENTITIES, INACTIVE, IN_MS } from "@/common/constants";
import { getDefaultListParams } from '@/common/utils';
import { ATTRIBUTES, GET_USER_QUERY_KEY, LIST_USERS_QUERY_KEY } from "@/components/users/users.constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from '@tanstack/react-query';
import { getItemByParam, listItems, useActiveItem, useCreateItem, useDeleteItemByParam, useEditItemByParam, useInactiveItem } from './common';

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

// export function useGetUser(username) {
//   const query = useQuery({
//     queryKey: [GET_USER_QUERY_KEY, username],
//     queryFn: () => getItemById({ key: "username", id: "", url: PATHS.USER, entity: ENTITIES.USER, params: { username } }),
//     retry: false,
//     staleTime: IN_MS.ONE_HOUR,
//   });

//   return query;
// };
export function useGetUser(username) {

  const query = useQuery({
    queryKey: [GET_USER_QUERY_KEY, username],
    queryFn: () => {
      return getItemByParam({
        paramKey: "username",
        paramValue: username,
        url: PATHS.USER,
        entitySingular: ENTITIES.USER,
        entityPlural: ENTITIES.USERS
      });
    },
    retry: false,
    staleTime: IN_MS.ONE_HOUR,
  });

  return query;
}

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

export const useEditUser = () => {
  const editItemByParam = useEditItemByParam();

  const editUser = async (user) => {
    const response = await editItemByParam({
      entity: ENTITIES.USERS,
      url: PATHS.USERS,
      paramKey: "username",
      paramValue: user,
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
    const response = await deleteItemByParam({
      entity: ENTITIES.USERS,
      url: PATHS.USER,
      paramKey: "username",
      paramValue: username,
      invalidateQueries: [[LIST_USERS_QUERY_KEY]]
    });

    return response;
  };

  return deleteUser;
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
