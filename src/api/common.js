import { config } from "@/config";
import { encodeUri, now } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import axios from './axios';
import localforage from "./local-forage";

export function removeStorageEntity(entity) {
  return localforage.removeItem(`${config.APP_ENV}-${entity}`);
}

// export async function listItems({ entity, url, params }) {
//   const list = async () => {
//     try {
//       let values = [];
//       let LastEvaluatedKey;

//       do {
//         const { data } = await axios.get(url, {
//           params: {
//             ...params,
//             ...(LastEvaluatedKey && { LastEvaluatedKey: encodeUri(LastEvaluatedKey) }),
//           }
//         });

//         if (data.statusOk) {
//           values = [...values, ...data[entity]];
//         }

//         LastEvaluatedKey = data?.LastEvaluatedKey;

//       } while (LastEvaluatedKey);

//       return values;
//     } catch (error) {
//       throw error;
//     }
//   };

//   let values = await localforage.getItem(`${config.APP_ENV}-${entity}`);
//   if (values) {
//     return { [entity]: values };
//   }
//   values = await list();
//   await localforage.setItem(`${config.APP_ENV}-${entity}`, values);
//   return { [entity]: values };
// }

export async function listItems({ entity, url, eventsUrl, params }) {
  const list = async () => {
    try {
      let values = [];
      let LastEvaluatedKey;

      // Realizar peticiones paginadas para obtener todos los elementos
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

  // Obtener el último `lastEventId` desde el almacenamiento local
  let lastEventId = await localforage.getItem(`${config.APP_ENV}-${entity}-lastEventId`);

  // Obtener los elementos actuales desde `localforage`
  let values = await localforage.getItem(`${config.APP_ENV}-${entity}`) || [];

  // Si hay un `lastEventId`, obtener eventos desde ese punto
  if (lastEventId) {
    try {
      const { data } = await axios.get(eventsUrl, { 
        params: { lastEventId } 
      });

      if (data.statusOk && data.events.length > 0) {
        const newEvents = data.events;

        // Aplicar los eventos a la lista de elementos almacenados
        newEvents.forEach(event => {
          event.value.forEach(item => {
            switch (event.action) {
              case 'C': // Crear nuevo elemento
                values = [...values, item];
                break;
              case 'U': // Actualizar elemento existente
                values = values.map(existingItem =>
                  existingItem.code === item.code ? { ...existingItem, ...item } : existingItem
                );
                break;
              case 'D': // Eliminar elemento
                values = values.filter(existingItem => existingItem.code !== item.code);
                break;
              default:
                console.warn(`Acción desconocida: ${event.action}`);
            }
          });
        });

        // Actualizar el `lastEventId` con el último evento procesado
        lastEventId = newEvents[newEvents.length - 1].id;
        await localforage.setItem(`${config.APP_ENV}-${entity}-lastEventId`, lastEventId);
      }

    } catch (error) {
      console.error(`Error al obtener eventos para ${entity}:`, error);
    }
  }

  // Si no hay valores almacenados en `localforage`, realizar una petición completa
  if (values.length === 0) {
    values = await list();
    await localforage.setItem(`${config.APP_ENV}-${entity}`, values);
  } else {
    // Si hay eventos y ya aplicamos los cambios, actualizar los elementos almacenados
    await localforage.setItem(`${config.APP_ENV}-${entity}`, values);
  }

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
