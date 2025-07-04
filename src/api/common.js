import { ALL, DELETE, ID, LAST_UPDATED_AT, USERNAME } from "@/common/constants";
import { now } from "@/common/utils/dates";
import { config } from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import { getInstance } from './axios';
import { addStorageItem, bulkAddStorageItems, getAllStorageItems, getStorageItem, removeStorageItem, updateOrCreateStorageItem } from "@/db";

async function entityList({ entity, url, params }) {
  try {
    let values = [];
    let LastEvaluatedKey;

    do {
      const queryParams = {
        ...params,
        ...(LastEvaluatedKey && { LastEvaluatedKey: JSON.stringify(LastEvaluatedKey) }),
      };

      const { data } = await getInstance().get(url, {
        params: queryParams,
      });

      if (data.statusOk) {
        values = [...values, ...data[entity]];
      }

      LastEvaluatedKey = data?.LastEvaluatedKey;
    } while (LastEvaluatedKey);

    return values;
  } catch (error) {
    console.error("entityList - Error fetching data:", error);
    throw error;
  }
};

export async function listItems({ entity, url, params, key = ID }) {
  params = { ...params, sort: 'updatedAt' };
  let updateLastUpdatedAt = false;
  let lastUpdatedAt = (await getStorageItem({ entity: LAST_UPDATED_AT, id: entity }))?.lastUpdatedAt;
  let values = await getAllStorageItems(entity);

  if (values?.length) {
    const outdatedValues = await entityList({ entity, url, params: { ...params, startDate: '2024-01-01' } });
    if (outdatedValues.length > 1) {
      updateLastUpdatedAt = true;
      for (const value of outdatedValues) {
        await updateOrCreateStorageItem({ entity, id: value[key], key, value });
      }
    }
  } else {
    values = await entityList({ entity, url, params });
    await bulkAddStorageItems({ entity, values });
    if (!!values.length) {
      updateLastUpdatedAt = true;
    }
  }

  if (updateLastUpdatedAt) {
    const { updatedAt, createdAt } = values[0];
    await updateOrCreateStorageItem({ entity: LAST_UPDATED_AT, id: entity, value: { lastUpdatedAt: updatedAt ?? createdAt } });
  }

  return { [entity]: values };
};

export function useCreateItem() {
  const queryClient = useQueryClient();

  const createItem = async ({ entity, value, url, responseEntity, invalidateQueries = [] }) => {
    const body = {
      ...value,
      createdAt: now(),
    };

    const { data } = await getInstance().post(url, body);

    if (data.statusOk) {
      await addStorageItem({ entity, value: data[responseEntity] });
      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: ALL });
      });
    }

    return data;
  };

  return createItem;
};

export function useInactiveItem() {
  const queryClient = useQueryClient();

  const inactiveItem = async ({ entity, value, url, responseEntity, invalidateQueries = [], key = ID }) => {
    const body = {
      ...value,
      updatedAt: now(),
    };

    const { data } = await getInstance().post(url, body);

    if (data.statusOk) {
      await updateOrCreateStorageItem({ entity, id: data[responseEntity][key], key, value: data[responseEntity] });
      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: ALL });
      });
    }

    return data;
  };

  return inactiveItem;
};

// to remove
export function useInactiveItemByParam() {
  const queryClient = useQueryClient();

  const inactiveItem = async ({ entity, value, url, params = {}, responseEntity, invalidateQueries = [], key }) => {
    const { data } = await getInstance().post(url, value, { params });

    if (data.statusOk) {
      await updateOrCreateStorageItem({ entity, id: data[responseEntity][key], key, value: data[responseEntity] });

      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: ALL });
      });
    }

    return data;
  };

  return inactiveItem;
};

// to remove
export function useActiveItemByParam() {
  const queryClient = useQueryClient();

  const activeItem = async ({ entity, value, url, params = {}, responseEntity, invalidateQueries = [], key }) => {
    const { data } = await getInstance().post(url, value, { params });

    if (data.statusOk) {
      await updateOrCreateStorageItem({ entity, id: data[responseEntity][key], key, value: data[responseEntity] });

      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: ALL });
      });
    }

    return data;
  };

  return activeItem;
};

export function useActiveItem() {
  const queryClient = useQueryClient();

  const activeItem = async ({ entity, value, url, responseEntity, invalidateQueries = [], key }) => {
    const body = {
      ...value,
      updatedAt: now(),
    };

    const { data } = await getInstance().post(url, body);

    if (data.statusOk) {
      await updateOrCreateStorageItem({ entity, id: data[responseEntity][key], key, value: data[responseEntity] });

      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: ALL });
      });
    }

    return data;
  };

  return activeItem;
};

export function useRecoverItem() {
  const queryClient = useQueryClient();

  const recoverItem = async ({ entity, url, responseEntity, invalidateQueries = [], key }) => {
    const body = {
      updatedAt: now(),
    };

    const { data } = await getInstance().post(url, body);

    if (data.statusOk) {
      await updateOrCreateStorageItem({ entity, id: data[responseEntity][key], key, value: data[responseEntity] });

      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: ALL });
      });
    }

    return data;
  };

  return recoverItem;
};

export function useEditItem() {
  const queryClient = useQueryClient();

  const editItem = async ({ entity, value, url, responseEntity, key = ID, invalidateQueries = [] }) => {
    const updatedItem = {
      ...value,
      updatedAt: now(),
    };
    const { data } = await getInstance().put(url, updatedItem);

    if (data.statusOk) {
      if (data[responseEntity]) {
        await updateOrCreateStorageItem({ entity, id: data[responseEntity][key], key, value: data[responseEntity] });
      }

      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: ALL });
      });
    } else {
      console.error("Error en la respuesta:", data.message);
    }

    return data;
  };

  return editItem;
};

export function useEditItemByParam() {
  const queryClient = useQueryClient();

  const editItemByParam = async ({ entity, url, value, username, responseEntity, invalidateQueries = [] }) => {

    const updatedItem = {
      ...value,
      updatedAt: now(),
    };

    const { data } = await getInstance().put(url, updatedItem, { params: { username } });

    if (data.statusOk) {
      if (data[responseEntity]) {
        if (!data[responseEntity].username) {
          console.error("❌ Error: El usuario editado no tiene ID:", data[responseEntity]);
          return;
        }
        await updateOrCreateStorageItem({ entity, id: data[responseEntity][key], key, value: data[responseEntity] });
      }

      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: ALL });
      });
    } else {
      console.error("⚠️ Error en la respuesta:", data.message);
    }

    return data;
  };

  return editItemByParam;
};

export function useDeleteItem() {
  const queryClient = useQueryClient();

  const deleteItem = async ({ entity, id, url, key = ID, invalidateQueries = [] }) => {
    const { data } = await getInstance().delete(`${url}/${id}`);

    if (data.statusOk) {
      await removeStorageItem({ entity, id });
    }
    invalidateQueries.forEach((query) => { queryClient.invalidateQueries({ queryKey: query, refetchType: ALL }); })
    return data;
  };
  return deleteItem;
};

export function useDeleteItemByParam() {
  const queryClient = useQueryClient();

  const deleteItemByParam = async ({ entity, url, params = {}, invalidateQueries = [] }) => {
    try {
      const { data } = await getInstance().delete(url, { params });

      if (data.statusOk) {
        await removeStorageItem({ entity, id: params.username, key: USERNAME });
      }

      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: ALL });
      });

      return data;
    } catch (error) {
      console.error("❌ Error en la petición DELETE:", error);
      throw error;
    }
  };

  return deleteItemByParam;
};

export function useBatchDeleteItems() {
  const queryClient = useQueryClient();

  const batchDeleteItems = async ({ entity, ids = [], url, key = ID, invalidateQueries = [] }) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      console.warn("No hay IDs válidos para eliminar.");
      return { statusOk: true, deletedCount: 0 };
    }

    const successfulDeletes = [];
    let deletedCount = 0;

    for (const code of ids) {
      try {
        const { data } = await getInstance().delete(`${url}/${code}`);
        if (data.statusOk) {
          deletedCount += 1;

          if (data.product?.state === DELETE) {
            successfulDeletes.push(code);
          }
        } else {
          console.warn(`No se pudo eliminar el ID ${code}:`, data.error);
        }
      } catch (error) {
        console.error(`Error al eliminar el elemento con ID ${code}:`, error);
      }
    }

    if (successfulDeletes.length > 0) {
      await removeStorageItemsByCustomFilter({
        entity,
        filter: (item) => !successfulDeletes.includes(item[key]),
      });
    }

    invalidateQueries.forEach((query) => {
      queryClient.invalidateQueries({ queryKey: query, refetchType: ALL });
    });

    return { statusOk: true, deletedCount };
  };

  return batchDeleteItems;
}

export async function removeStorageItemsByCustomFilter({ entity, filter }) {
  // const values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
  // if (!values) {
  //   console.warn("No se encontraron valores en el storage para la entidad:", entity);
  //   return;
  // }
  // const filteredValues = values.filter(filter);
  // await localforage.setItem(`${config.APP_ENV}-${entity}`, filteredValues);
};
