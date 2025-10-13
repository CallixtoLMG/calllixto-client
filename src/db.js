import { LAST_UPDATED_AT } from '@/common/constants';
import Dexie from 'dexie';

export const db = new Dexie('Callixto');

db.version(1).stores({
  customers: 'id, updatedAt',
  brands: 'id, updatedAt',
  suppliers: 'id, updatedAt',
  products: 'id, updatedAt',
  budgets: 'id, updatedAt',
  expenses: 'id, updatedAt',
  users: 'id, updatedAt',
  cashBalances: 'id, updatedAt',
  settings: 'entity, updatedAt',
  [LAST_UPDATED_AT]: 'id',
});

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

export async function removeStorageItemsByFilter({ entity, filter }) {
  const allItems = await db[entity].toArray();
  const idsToDelete = allItems
    .filter(filter)
    .map(item => item.id);

  if (idsToDelete.length) {
    await db[entity].bulkDelete(idsToDelete);
  }
};