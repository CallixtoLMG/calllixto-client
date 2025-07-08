import { ALL, DATE_FORMATS, DEFAULT_KEY, LAST_UPDATED_AT } from "@/common/constants";
import { getDateWithOffset, now } from "@/common/utils/dates";
import { useQueryClient } from "@tanstack/react-query";
import { getInstance } from './axios';
import { bulkAddStorageItems, clearStorageTable, getAllStorageItems, getStorageItem, removeStorageItem, updateOrCreateStorageItem } from "@/db";
import { getDefaultAttributes } from "@/common/utils";
import { pick } from 'lodash';

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

export async function listItems({ entity, url, params = {} }) {
  params = { ...params, sort: 'updatedAt' };
  let updateLastUpdatedAt = false;
  let lastUpdatedAt = (await getStorageItem({ entity: LAST_UPDATED_AT, id: entity }))?.lastUpdatedAt;

  if (lastUpdatedAt) {

    const startDate = getDateWithOffset({ date: lastUpdatedAt, offset: 1, unit: 'seconds', format: DATE_FORMATS.ISO });
    const outdatedValues = await entityList({ entity, url, params: { ...params, startDate } });
    if (!!outdatedValues.length) {
      updateLastUpdatedAt = true;
      for (const value of outdatedValues) {
        await updateOrCreateStorageItem({ entity, value });
      }
    }
  } else {
    await clearStorageTable(entity);
    const data = await entityList({ entity, url, params });
    if (!!data.length) {
      await bulkAddStorageItems({ entity, values: data });
      updateLastUpdatedAt = true;
    }
  }

  const values = await getAllStorageItems({ entity, order: 'descending' });

  if (updateLastUpdatedAt) {
    const { updatedAt, createdAt } = values[0];
    await updateOrCreateStorageItem({ entity: LAST_UPDATED_AT, value: { id: entity, lastUpdatedAt: updatedAt ?? createdAt } });
  }

  return { [entity]: values };
};

export function useCreateItem() {
  const invalidate = useInvalidateQueries();

  const createItem = async ({ entity, value = {}, url, responseEntity, invalidateQueries = [], attributes }) => {
    const body = {
      ...value,
      createdAt: now(),
      updatedAt: now(),
    };

    const { data } = await getInstance().post(url, body);

    if (data.statusOk) {
      await updateOrCreateStorageItem({
        entity,
        value: attributes ? pick(data[responseEntity], getDefaultAttributes(attributes)) : data[responseEntity]
      });
      invalidate(invalidateQueries);
    }

    return data;
  };

  return createItem;
};

export function usePostUpdateItem() {
  const invalidate = useInvalidateQueries();

  const postItem = async ({ entity, value = {}, url, responseEntity, invalidateQueries = [], params = {}, attributes }) => {
    const body = {
      ...value,
      updatedAt: now(),
    };

    const { data } = await getInstance().post(url, body, { params });

    if (data.statusOk) {
      await updateOrCreateStorageItem({
        entity,
        value: attributes ? pick(data[responseEntity], getDefaultAttributes(attributes)) : data[responseEntity]
      });
      invalidate(invalidateQueries);
    }

    return data;
  };

  return postItem;
};

export function useEditItem() {
  const invalidate = useInvalidateQueries();

  const editItem = async ({ entity, value = {}, url, responseEntity, invalidateQueries = [], params = {}, attributes }) => {
    const updatedItem = {
      ...value,
      updatedAt: now(),
    };

    const { data } = await getInstance().put(url, updatedItem, { params });

    if (data.statusOk && data[responseEntity]) {
      await updateOrCreateStorageItem({
        entity,
        value: attributes ? pick(data[responseEntity], getDefaultAttributes(attributes)) : data[responseEntity]
      });
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
