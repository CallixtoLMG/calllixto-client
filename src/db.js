import Dexie from 'dexie';
import { ID, LAST_UPDATED_AT } from '@/common/constants';

export const db = new Dexie('Callixto');

db.version(1).stores({
  customers: 'id',
  brands: 'id',
  suppliers: 'id',
  products: 'code',
  budgets: 'id',
  [LAST_UPDATED_AT]: 'id',
});

export async function addStorageItem({ entity, value }) {
  await db[entity].add(value);
};

export async function bulkAddStorageItems({ entity, values }) {
  await db[entity].bulkAdd(values);
};

export function getStorageItem({ entity, id }) {
  return db[entity].get(id);
};

export function getAllStorageItems(entity) {
  return db[entity].toArray();
};

export async function updateOrCreateStorageItem({ entity, id, key = ID, value }) {
  const existingItem = await getStorageItem({ entity, id });
  if (!existingItem) {
    await addStorageItem({ entity, value: { [key]: id, ...value } });
    return;
  }
  return db[entity].update(id, value);
};

export async function removeStorageItem({ entity, id }) {
  await db[entity].delete(id);
};

export async function clearStorageTable(entity) {
  await db[entity].clear();
};