import { encodeUri } from "@/utils";
import axios from './axios';
import localforage from "./local-forage";

export async function getAllEntity({ entity, url, params }) {
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

  let values = await localforage.getItem(entity);
  if (values) {
    return { [entity]: values };
  }
  values = await list();
  await localforage.setItem(entity, values);
  return { [entity]: values };
};