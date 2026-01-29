import { ENTITIES, LAST_UPDATED_AT } from '@/common/constants';
import { config } from "@/config";
import Dexie from 'dexie';

let db;

if (typeof window !== "undefined") {
  db = new Dexie(`${config.APP_ENV}-Callixto-${localStorage.getItem("selectedClientId")}`);
  db.version(1).stores({
    [ENTITIES.CUSTOMERS]: 'id, updatedAt',
    [ENTITIES.BRANDS]: 'id, updatedAt',
    [ENTITIES.SUPPLIERS]: 'id, updatedAt',
    [ENTITIES.PRODUCTS]: 'id, updatedAt',
    [ENTITIES.BUDGETS]: 'id, updatedAt',
    [ENTITIES.EXPENSES]: 'id, updatedAt',
    [ENTITIES.USERS]: 'id, updatedAt',
    [ENTITIES.CASHBALANCES]: 'id, updatedAt',
    [ENTITIES.SETTINGS]: 'entity, updatedAt',
    [LAST_UPDATED_AT]: 'id',
  });
};

export { db };

export async function bulkAddStorageItems({ entity, values }) {
  await db[entity].bulkAdd(values);
};

export function getStorageItem({ entity, id }) {
  return db[entity].get(id);
};

export function getAllStorageItems({ entity, sort, order }) {
  let query = db[entity];
  if (sort) {
    query = query.orderBy(sort);
  }

  if (order === 'descending') {
    query = query.reverse();
  }

  return query.toArray();
};

export async function updateOrCreateStorageItem({ entity, value }) {
  return db[entity].put(value);
};

export async function removeStorageItem({ entity, id }) {
  await db[entity].delete(id);
};

export async function clearStorageTable(entity) {
  await db[entity].clear();
};

export async function removeStorageItemById({ entity, id }) {
  if (!entity || id === undefined || id === null || id === "") {
    return;
  }
};