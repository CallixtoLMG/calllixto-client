import { config } from "@/config";
import { encodeUri, now } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import axios from './axios';
import localforage from "./local-forage";

export function removeStorageEntity(entity) {
  return localforage.removeItem(`${config.APP_ENV}-${entity}`);
}

export async function listItems({ entity, url, params }) {
  const list = async () => {
    try {
      let values = [];
      let LastEvaluatedKey;

      do {
        const { data } = await axios.get(url, {
          params: {
            ...params,
            ...(LastEvaluatedKey && { LastEvaluatedKey: encodeUri(LastEvaluatedKey) }),
          }
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
  };

  let values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
  if (values) {
    return { [entity]: values };
  }
  values = await list();
  await localforage.setItem(`${config.APP_ENV}-${entity}`, values);
  return { [entity]: values };
}

export async function getItemById({ id, url, entity, key = 'id' }) {
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

export function useEditItem() {
  const queryClient = useQueryClient();

  const editItem = async ({ entity, value, url, responseEntity, key, invalidateQueries = [] }) => {
    const updatedItem = {
      ...value,
      updatedAt: now(),
    };
    const { data } = await axios.put(url, updatedItem);

    if (data.statusOk) {
      await updateStorageItem({ entity, key, value: data[responseEntity] });

      invalidateQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query, refetchType: 'all' });
      });
    }

    return data;
  };

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
