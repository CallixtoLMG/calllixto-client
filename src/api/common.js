import { encodeUri, now } from "@/utils";
import axios from './axios';
import localforage from "./local-forage";
import { config } from "@/config";

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

export async function createItem({ entity, value, url, responseEntity }) {
  const body = {
    ...value,
    createdAt: now()
  }
  const { data } = await axios.post(url, body);

  if (data.statusOk) {
    await addStorageItem({ entity, value: data[responseEntity] });
  }

  return data;
}

export async function deleteItem({ entity, id, url, key }) {
  const { data } = await axios.delete(`${url}/${id}`);

  if (data.statusOk) {
    await removeStorageItem({ entity, id, key });
  }

  return data;
}

export async function addStorageItem({ entity, value }) {
  const values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
  await localforage.setItem(`${config.APP_ENV}-${entity}`, [value, ...values]);
}

export async function removeStorageItem({ entity, id, key = 'id' }) {
  const values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
  await localforage.setItem(`${config.APP_ENV}-${entity}`, values.filter((item) => item[key] !== id));
}
