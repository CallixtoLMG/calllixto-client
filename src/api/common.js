import { config } from "@/config";
import { ALL, DEFAULT_LAST_EVENT_ID, ENTITIES, EVENT_KEYS, ID } from "@/constants";
import { EVENTS, PATHS } from "@/fetchUrls";
import { now } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getInstance } from './axios';
import localforage from "./local-forage";

export function removeStorageEntity(entity) {
  return localforage.removeItem(`${config.APP_ENV}-${entity}`);
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
}

async function handleEvents({ entity, values, key = ID }) {
  let lastEventId = await localforage.getItem(`${config.APP_ENV}-${entity}-lastEventId`);


  if (!lastEventId) {
    lastEventId = DEFAULT_LAST_EVENT_ID;
    await localforage.setItem(`${config.APP_ENV}-${entity}-lastEventId`, lastEventId);
  }

  const { data: eventsData } = await getInstance().get(`${EVENTS}/${entity}`, {
    params: { lastEventId },
  });

  if (eventsData.statusOk) {
    const newEvents = eventsData.events;

    lastEventId = newEvents[newEvents.length - 1]?.id;
    if (lastEventId) {
      await localforage.setItem(`${config.APP_ENV}-${entity}-lastEventId`, lastEventId);
    }

    if (newEvents.some((event) => event.action === EVENT_KEYS.UPDATE_ALL)) {
      return [];
    }

    for (const event of newEvents) {
      if (event.action === EVENT_KEYS.CREATE) {
        event.value.forEach((item) => {
          const exists = values.find((existingItem) => existingItem[key] === item[key]);
          if (!exists) {
            values = [item, ...values];
          }
        });
      }

      if (event.action === EVENT_KEYS.UPDATE) {
        event.value.forEach((item) => {
          values = values.map((existingItem) =>
            existingItem[key] === item[key] ? { ...existingItem, ...item } : existingItem
          );
        });
      }

      if (event.action === EVENT_KEYS.DELETE) {
        const idsToDelete = event.value.map((item) => item[key]);
        values = values.filter(existingItem => !idsToDelete.includes(existingItem[key]));
      }

      if (event.action === EVENT_KEYS.DELETE_SUPPLIER_PRODUCTS) {
        const supplierIdToDelete = event.value.supplierId;

        await removeStorageItemsByCustomFilter({
          entity: ENTITIES.PRODUCTS,
          filter: (product) => product.code.slice(0, 2) !== supplierIdToDelete
        });

        values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
      }
    }
  }

  return values;
}

export async function listItems({ entity, url, params, key = ID }) {
  let values = await localforage.getItem(`${config.APP_ENV}-${entity}`);

  if (values?.length) {
    values = await handleEvents({ entity, values, key });
  }

  if (!values || values.length === 0) {
    values = await entityList({ entity, url, params });

    await localforage.setItem(`${config.APP_ENV}-${entity}`, values);

    const { data } = await getInstance().get(`${PATHS.EVENTS}/${entity}`, { params: { order: false, pageSize: 1 } });
    const lastEventId = data?.events?.[0]?.id;

    if (lastEventId) {
      await localforage.setItem(`${config.APP_ENV}-${entity}-lastEventId`, lastEventId);
    }
  }

  await localforage.setItem(`${config.APP_ENV}-${entity}`, values);

  return { [entity]: values };
};

export async function getItemById({ id, url, entity, key = ID, params }) {
  await listItems({ entity, url, params, key })
  const getEntity = async () => {
    try {
      const { data } = await getInstance().get(`${url}/${id}`);
      if (data.statusOk) {
        return data;
      }
    } catch (error) {
      throw error;
    }
  };

  let value = (await localforage.getItem(`${config.APP_ENV}-${entity}`)).find((item) => item[key] === id);
  if (value) {
    return value;
  }
  return getEntity();
}

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
      await updateStorageItem({ entity, value: data[responseEntity], key });
      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: ALL });
      });
    }

    return data;
  };

  return inactiveItem;
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

      await updateStorageItem({ entity, value: data[responseEntity], key });

      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: ALL });
      });
    }

    return data;
  };

  return activeItem;
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
        await updateStorageItem({ entity, key, value: data[responseEntity] });
      }

      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: ALL });
      });
    } else {
      console.error("Error en la respuesta:", data.message);
    }

    return data;
  }

  return editItem;
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  const deleteItem = async ({ entity, id, url, key = ID, invalidateQueries = [] }) => {
    const { data } = await getInstance().delete(`${url}/${id}`);

    if (data.statusOk) {
      await removeStorageItem({ entity, id, key });
    }
    invalidateQueries.forEach((query) => { queryClient.invalidateQueries({ queryKey: query, refetchType: ALL }); })
    return data;
  }
  return deleteItem;
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

          if (data.product?.state === "delete") {
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


export async function addStorageItem({ entity, value }) {
  const values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
  await localforage.setItem(`${config.APP_ENV}-${entity}`, [value, ...values]);
};

export async function updateStorageItem({ entity, value, key = ID }) {
  const values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
  const updatedArray = values.map(item => item[key] === value[key] ? { ...item, ...value } : item)
  await localforage.setItem(`${config.APP_ENV}-${entity}`, updatedArray);
};

export async function removeStorageItem({ entity, id, key = ID }) {
  const values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
  await localforage.setItem(`${config.APP_ENV}-${entity}`, values.filter((item) => item[key] !== id));
};

export async function removeStorageItemsByCustomFilter({ entity, filter }) {
  const values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
  if (!values) {
    console.warn("No se encontraron valores en el storage para la entidad:", entity);
    return;
  }
  const filteredValues = values.filter(filter);
  await localforage.setItem(`${config.APP_ENV}-${entity}`, filteredValues);
};