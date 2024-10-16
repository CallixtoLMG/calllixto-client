import { config } from "@/config";
import { CREATE_KEY, DELETE_KEY, UPDATE_KEY } from "@/constants";
import { PATHS } from "@/fetchUrls";
import { encodeUri, now } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import axios from './axios';
import localforage from "./local-forage";

export function removeStorageEntity(entity) {
  return localforage.removeItem(`${config.APP_ENV}-${entity}`);
}

async function entityList({ entity, url, params }) {
  try {
    let values = [];
    let LastEvaluatedKey;

    do {
      const { data } = await axios.get(url, {
        params: {
          ...params,
          ...(LastEvaluatedKey && { LastEvaluatedKey: encodeUri(LastEvaluatedKey) }),
        },
      });

      if (data.statusOk) {
        values = [...values, ...data[entity]];
      }

      LastEvaluatedKey = data?.LastEvaluatedKey;
    } while (LastEvaluatedKey);

    return values;
  } catch (error) {
    throw error;
  }
}

export async function handleEvents({ entity, values, key = "id" }) {
  let lastEventId = await localforage.getItem(`${config.APP_ENV}-${entity}-lastEventId`);

  if (!lastEventId) {
    return values;
  }

  const { data: eventsData } = await axios.get(`events/${entity}`, {
    params: { lastEventId },
  });

  if (eventsData.statusOk) {
    const newEvents = eventsData.events;

    lastEventId = newEvents[newEvents.length - 1]?.id;

    if (lastEventId) {
      await localforage.setItem(`${config.APP_ENV}-${entity}-lastEventId`, lastEventId);
    }

    newEvents.forEach((event) => {
      if (event.action === CREATE_KEY) {
        event.value.forEach((item) => {
          const exists = values.find((existingItem) => existingItem[key] === item[key]);
          if (!exists) {
            values = [item, ...values];
          }
        });
      }

      if (event.action === UPDATE_KEY) {
        event.value.forEach((item) => {

          values = values.map((existingItem) =>
            existingItem[key] === item[key] ? { ...existingItem, ...item } : existingItem
          );
        });
      }

      if (event.action === DELETE_KEY) {
        values = values.filter(existingItem => !event.value.map((item) => item[key]).includes(existingItem[key]));
      }
    });
  }

  return values;
}

export async function listItems({ entity, url, params, key = "id" }) {
  let values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
  if (!values?.length) {

    values = await entityList({ entity, url, params });

    await localforage.setItem(`${config.APP_ENV}-${entity}`, values);

    const { data } = await axios.get(`${PATHS.EVENTS}/${entity}`, { params: { order: false, pageSize: 1 } });

    const lastEventId = data?.events?.[0]?.id;
    if (lastEventId) {
      await localforage.setItem(`${config.APP_ENV}-${entity}-lastEventId`, lastEventId);
    }
  } else {
    values = await handleEvents({ entity, values, key });
  }

  await localforage.setItem(`${config.APP_ENV}-${entity}`, values);

  return { [entity]: values };
}


export async function getItemById({ id, url, entity, key = 'id', params }) {
  await listItems({ entity, url, params, key })
  const getEntity = async (id) => {
    try {
      const { data } = await axios.get(`${url}/${id}`);
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

    const { data } = await axios.post(url, body);

    if (data.statusOk) {
      await addStorageItem({ entity, value: data[responseEntity] });

      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: 'all' });
      });
    }

    return data;
  };

  return createItem;
};

export function useInactiveItem() {
  const queryClient = useQueryClient();

  const inactiveItem = async ({ entity, value, url, responseEntity, invalidateQueries = [], key }) => {
    const body = {
      ...value,
      updatedAt: now(),
    };

    const { data } = await axios.post(url, body);
    
    if (data.statusOk) {
      await updateStorageItem({ entity, value: data[responseEntity], key });
      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: 'all' });
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

    const { data } = await axios.post(url, body);

    if (data.statusOk) {

      await updateStorageItem({ entity, value: data[responseEntity], key });

      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: 'all' });
      });
    }

    return data;
  };

  return activeItem;
};

export function useEditItem() {
  const queryClient = useQueryClient();

  const editItem = async ({ entity, value, url, responseEntity, key, invalidateQueries = [] }) => {
    const updatedItem = {
      ...value,
      updatedAt: now(),
    };
    const { data } = await axios.put(url, updatedItem);

    if (data.statusOk) {
      if (data[responseEntity]) {
        await updateStorageItem({ entity, key, value: data[responseEntity] });
      }

      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: 'all' });
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

  const deleteItem = async ({ entity, id, url, key, invalidateQueries = [] }) => {
    const { data } = await axios.delete(`${url}/${id}`);

    if (data.statusOk) {
      await removeStorageItem({ entity, id, key });
    }
    invalidateQueries.forEach((query) => { queryClient.invalidateQueries({ queryKey: query, refetchType: 'all' }); })
    return data;
  }
  return deleteItem;
};

export async function addStorageItem({ entity, value }) {
  const values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
  await localforage.setItem(`${config.APP_ENV}-${entity}`, [value, ...values]);
};

export async function updateStorageItem({ entity, value, key = "id" }) {
  const values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
  const updatedArray = values.map(item => item[key] === value[key] ? { ...item, ...value } : item)
  await localforage.setItem(`${config.APP_ENV}-${entity}`, updatedArray);
};

export async function removeStorageItem({ entity, id, key = 'id' }) {
  const values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
  await localforage.setItem(`${config.APP_ENV}-${entity}`, values.filter((item) => item[key] !== id));
};

export async function removeStorageItemsByCustomFilter({ entity, filter }) {
  const values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
  await localforage.setItem(`${config.APP_ENV}-${entity}`, values.filter(filter));
};
