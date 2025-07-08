import { ALL, DEFAULT_KEY, LAST_UPDATED_AT } from "@/common/constants";
import { now } from "@/common/utils/dates";
import { useQueryClient } from "@tanstack/react-query";
import { getInstance } from './axios';
import { addStorageItem, bulkAddStorageItems, getAllStorageItems, getStorageItem, removeStorageItem, updateOrCreateStorageItem } from "@/db";

function useInvalidateQueries() {
  const queryClient = useQueryClient();
  return (queries) => {
    queries.forEach((queryKey) => { queryClient.invalidateQueries({ queryKey, refetchType: ALL }); });
  };
}

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

export async function listItems({ entity, url, params = {}, key = DEFAULT_KEY }) {
  params = { ...params, sort: 'updatedAt' };
  let updateLastUpdatedAt = false;
  let lastUpdatedAt = (await getStorageItem({ entity: LAST_UPDATED_AT, id: entity }))?.lastUpdatedAt;
  let values = await getAllStorageItems(entity);

  if (!!values?.length && lastUpdatedAt) {
    const outdatedValues = await entityList({ entity, url, params: { ...params, startDate: lastUpdatedAt } });
    if (outdatedValues.length > 1) {
      updateLastUpdatedAt = true;
      // try to use some bulkPut eventually
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
  const invalidate = useInvalidateQueries();

  const createItem = async ({ entity, value = {}, url, responseEntity, invalidateQueries = [] }) => {
    const body = {
      ...value,
      createdAt: now(),
    };

    const { data } = await getInstance().post(url, body);

    if (data.statusOk) {
      await addStorageItem({ entity, value: data[responseEntity] });
      invalidate(invalidateQueries);
    }

    return data;
  };

  return createItem;
};

export function usePostUpdateItem() {
  const invalidate = useInvalidateQueries();

  const postItem = async ({ entity, value = {}, url, responseEntity, invalidateQueries = [], key = DEFAULT_KEY, params = {} }) => {
    const body = {
      ...value,
      updatedAt: now(),
    };

    const { data } = await getInstance().post(url, body, { params });

    if (data.statusOk) {
      await updateOrCreateStorageItem({ entity, id: data[responseEntity][key], key, value: data[responseEntity] });
      invalidate(invalidateQueries);
    }

    return data;
  };

  return postItem;
};

export function useEditItem() {
  const invalidate = useInvalidateQueries();

  const editItem = async ({ entity, value = {}, url, responseEntity, key = DEFAULT_KEY, invalidateQueries = [], params = {} }) => {
    const updatedItem = {
      ...value,
      updatedAt: now(),
    };

    const { data } = await getInstance().put(url, updatedItem, { params });

    if (data.statusOk && data[responseEntity]) {
      await updateOrCreateStorageItem({ entity, id: data[responseEntity][key], key, value: data[responseEntity] });
      invalidate(invalidateQueries);
    } else {
      console.error("Error en la respuesta:", data.message);
    }

    return data;
  };

  return editItem;
};

export function useDeleteItem() {
  const invalidate = useInvalidateQueries();

  const deleteItem = async ({ entity, id, url, invalidateQueries = [], params = {} }) => {
    const { data } = await getInstance().delete(url, { params });

    if (data.statusOk) {
      await removeStorageItem({ entity, id });
      invalidate(invalidateQueries);
    }

    return data;
  };
  return deleteItem;
};

export async function removeStorageItemsByCustomFilter({ entity, filter }) {
  // const values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
  // if (!values) {
  //   console.warn("No se encontraron valores en el storage para la entidad:", entity);
  //   return;
  // }
  // const filteredValues = values.filter(filter);
  // await localforage.setItem(`${config.APP_ENV}-${entity}`, filteredValues);
};
