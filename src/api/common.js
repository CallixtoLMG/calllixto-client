import { ALL, DATE_FORMATS, LAST_UPDATED_AT } from "@/common/constants";
import { getDefaultAttributes } from "@/common/utils";
import { getDateWithOffset } from "@/common/utils/dates";
import { bulkAddStorageItems, clearStorageTable, getAllStorageItems, getStorageItem, removeStorageItem, removeStorageItemById, updateOrCreateStorageItem } from "@/db";
import { useQueryClient } from "@tanstack/react-query";
import { pick } from 'lodash';
import { getInstance } from './axios';

export function useInvalidateQueries() {
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
  let updateLastUpdatedAt = false;
  let lastUpdatedAt = (await getStorageItem({ entity: LAST_UPDATED_AT, id: entity }))?.lastUpdatedAt;

  if (lastUpdatedAt) {
    const startDate = getDateWithOffset({ date: lastUpdatedAt, offset: 1, unit: 'seconds', format: DATE_FORMATS.ISO });
    const outdatedValues = await entityList({ entity, url, params: { ...params, sort: 'updatedAt', startDate } });
    if (!!outdatedValues.length) {
      updateLastUpdatedAt = true;
      for (const value of outdatedValues) {
        if (value.state === 'HARD_DELETED') {
          await removeStorageItem({ entity, id: value.id });
        } else {
          await updateOrCreateStorageItem({ entity, value });
        }
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

  const values = await getAllStorageItems({ entity, order: 'descending', sort: 'updatedAt' });

  if (updateLastUpdatedAt) {
    const { updatedAt, createdAt } = values[0];
    await updateOrCreateStorageItem({ entity: LAST_UPDATED_AT, value: { id: entity, lastUpdatedAt: updatedAt ?? createdAt } });
  }

  return { [entity]: values };
};

export function useCreateItem() {
  const invalidate = useInvalidateQueries();

  const createItem = async ({ entity, value = {}, url, responseEntity, invalidateQueries = [], attributes, skipStorageUpdate }) => {
    const { data } = await getInstance().post(url, value);

    if (data.statusOk) {
      if (!skipStorageUpdate) {
        await updateOrCreateStorageItem({
          entity,
          value: attributes ? pick(data[responseEntity], getDefaultAttributes(attributes)) : data[responseEntity],
        });
      }
      invalidate(invalidateQueries);
    }
    return data;
  };

  return createItem;
};

export function usePostUpdateItem() {
  const invalidate = useInvalidateQueries();

  const postItem = async ({ entity, value = {}, url, responseEntity, invalidateQueries = [], params = {}, attributes }) => {
    const { data } = await getInstance().post(url, value, { params });

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

  const editItem = async ({ entity, value = {}, url, responseEntity, invalidateQueries = [], params = {}, attributes, skipStorageUpdate = false, }) => {
    const { data } = await getInstance().put(url, value, { params });

    if (data.statusOk && data[responseEntity]) {
      if (!skipStorageUpdate) {
        await updateOrCreateStorageItem({
          entity,
          value: attributes
            ? pick(data[responseEntity], getDefaultAttributes(attributes))
            : data[responseEntity],
        });
      }
      invalidate(invalidateQueries);
    } else {
      console.error("Error en la respuesta:", data.message);
    }

    return data;
  };

  return editItem;
}

export function useDeleteItem() {
  const invalidate = useInvalidateQueries();

  const deleteItem = async ({ entity, id, url, invalidateQueries = [], params = {}, skipStorageUpdate }) => {
    const { data } = await getInstance().delete(url, { params });

    if (data.statusOk) {
      if (!skipStorageUpdate) {
        await removeStorageItem({ entity, id });
      }
      invalidate(invalidateQueries);
    }
    return data;
  };
  return deleteItem;
};

export function useBatchDeleteItem() {
  const invalidate = useInvalidateQueries();

  const batchDeleteItem = async ({
    entity,
    url,
    ids,
    deleteCondition = () => true, 
    invalidateQueries = [],
  }) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      console.warn("[BatchDelete] No hay IDs válidos para eliminar.");
      return { statusOk: true, deletedCount: 0 };
    }

    const successfulDeletes = [];
    let deletedCount = 0;

    for (const id of ids) {
      try {
        const { data } = await getInstance().delete(`${url}/${id}`);
        if (data.statusOk) {
          deletedCount++;
          if (deleteCondition(data)) {
            successfulDeletes.push(id);
          }
        } else {
          console.warn(`[BatchDelete] No se pudo eliminar el ID ${id}:`, data.error);
        }
      } catch (error) {
        console.error(`[BatchDelete] Error al eliminar ID ${id}:`, error);
      }
    }

    if (successfulDeletes.length > 0) {
      await Promise.all(
        successfulDeletes.map((id) =>
          removeStorageItemById({ entity, id })
        )
      );
    }

    invalidate(invalidateQueries);

    return { statusOk: true, deletedCount };
  };

  return batchDeleteItem;
};
